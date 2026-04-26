import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { fetchOpenRouter, safeParseJSON, AI_COSTS } from '../utils/ai';

const OracleContext = createContext();

export const OracleProvider = ({ children }) => {
    const { user, profile, spendCredits } = useAuth();
    
    // UI States
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [activeAsset, setActiveAsset] = useState(null);
    const [rightPanelTab, setRightPanelTab] = useState('sketchboard'); // 'sketchboard' | 'analysis' | 'prompt'
    
    // Loading States
    const [status, setStatus] = useState({
        isTyping: false,
        isGenerating: false,
        isAnalyzing: false,
        loopIteration: 0
    });

    const [error, setError] = useState(null);

    // --- Persistence Logic ---
    
    const fetchProjects = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('oracle_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('last_active', { ascending: false });
            
            if (data) setProjects(data);
            if (error) {
                console.warn('[ORACLE_DB_WARN]: Table might not exist yet. Please run migration.', error);
                setError("DATABASE_OFFLINE: Please run the Supabase migration script.");
            }
        } catch (err) {
            console.error('[ORACLE_FETCH_FATAL]', err);
        }
    }, [user]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const saveProject = async (project) => {
        if (!user || !project) return;
        
        const { error } = await supabase
            .from('oracle_sessions')
            .upsert({
                id: project.id,
                user_id: user.id,
                title: project.title,
                messages: project.messages,
                assets: project.assets,
                last_active: new Date().toISOString()
            });
        
        if (error) console.error('[ORACLE_SAVE_ERR]', error);
        fetchProjects();
    };

    const createProject = async (title = "Untitled Project") => {
        const newProject = {
            id: crypto.randomUUID(),
            title,
            messages: [{ role: 'assistant', content: "ORACLE_ONLINE. How shall we re-render your vision today?" }],
            assets: []
        };
        setCurrentProject(newProject);
        setActiveAsset(null);
        await saveProject(newProject);
    };

    const loadProject = (project) => {
        setCurrentProject(project);
        if (project.assets?.length > 0) {
            setActiveAsset(project.assets[project.assets.length - 1]);
        } else {
            setActiveAsset(null);
        }
    };

    // --- Core AI Actions ---

    const chat = async (messageText, imageUrl = null) => {
        if (!currentProject || !user) return;
        
        setStatus(prev => ({ ...prev, isTyping: true }));
        const userMsg = { role: 'user', content: messageText, image: imageUrl };
        const updatedMessages = [...currentProject.messages, userMsg];
        
        try {
            const apiMessages = imageUrl ? [
                { role: 'system', content: `You are Oracle. Analyze this image and text. Respond in simple English.` },
                { role: 'user', content: [
                    { type: 'text', text: messageText },
                    { type: 'image_url', image_url: { url: imageUrl } }
                ]}
            ] : [
                { role: 'system', content: `You are Oracle, the high-performance creative brain of RE-RENDER. Your goal is to guide users to viral creative results. Use **bold text** for key highlights. Use simple English.` },
                ...updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
            ];

            const data = await fetchOpenRouter({
                model: imageUrl ? 'baidu/qianfan-ocr-fast:free' : 'google/gemma-4-31b-it:free',
                messages: apiMessages
            });

            const reply = data.choices?.[0]?.message?.content || 'NO_RESPONSE';
            const finalMessages = [...updatedMessages, { role: 'assistant', content: reply }];
            
            const updatedProject = { ...currentProject, messages: finalMessages };
            setCurrentProject(updatedProject);
            await saveProject(updatedProject);
        } catch (err) {
            setError(err.message);
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };

    const generateImage = async (prompt) => {
        if (!user || !currentProject) return;
        setStatus(prev => ({ ...prev, isGenerating: true }));
        
        try {
            const response = await fetch('/.netlify/functions/generate-wallpaper', {
                method: 'POST',
                body: JSON.stringify({ prompt, width: 1024, height: 1024 })
            });
            const data = await response.json();
            
            if (data.url) {
                const newAsset = {
                    id: crypto.randomUUID(),
                    url: data.url,
                    prompt,
                    grade: null,
                    ctr: null,
                    analysis: null,
                    timestamp: new Date().toISOString()
                };
                
                const updatedProject = {
                    ...currentProject,
                    assets: [...currentProject.assets, newAsset]
                };
                setCurrentProject(updatedProject);
                setActiveAsset(newAsset);
                await saveProject(updatedProject);
                return newAsset;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setStatus(prev => ({ ...prev, isGenerating: false }));
        }
    };

    const analyzeAsset = async (asset) => {
        if (!user || !asset) return;
        setStatus(prev => ({ ...prev, isAnalyzing: true }));

        try {
            const data = await fetchOpenRouter({
                model: 'baidu/qianfan-ocr-fast:free',
                messages: [
                    { role: 'system', content: `You are NEURAL. Analyze this thumbnail. Return JSON: { "grade": "A|B|C", "ctr": "X.X%", "feedback": "...", "improvements": ["..."] }` },
                    { role: 'user', content: [{ type: 'image_url', image_url: { url: asset.url } }] }
                ]
            });

            const analysis = safeParseJSON(data.choices?.[0]?.message?.content);
            if (analysis) {
                const updatedAssets = currentProject.assets.map(a => 
                    a.id === asset.id ? { ...a, grade: analysis.grade, ctr: analysis.ctr, analysis } : a
                );
                const updatedProject = { ...currentProject, assets: updatedAssets };
                setCurrentProject(updatedProject);
                setActiveAsset(updatedAssets.find(a => a.id === asset.id));
                await saveProject(updatedProject);
                return { ...asset, ...analysis }; // Return updated asset for loop
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setStatus(prev => ({ ...prev, isAnalyzing: false }));
        }
    };

    const runNeuralLoop = async (initialPrompt) => {
        if (!user || !currentProject) return;
        
        let currentPrompt = initialPrompt;
        let iteration = 0;
        const MAX_ITERATIONS = 3;
        const TARGET_GRADE = 'A';

        while (iteration < MAX_ITERATIONS) {
            iteration++;
            setStatus(prev => ({ ...prev, loopIteration: iteration }));
            
            // 1. Generate
            const asset = await generateImage(currentPrompt);
            if (!asset) break;

            // 2. Analyze
            const updatedAsset = await analyzeAsset(asset);
            if (!updatedAsset) break;

            if (updatedAsset.grade === TARGET_GRADE) {
                chat(`✅ **OPTIMIZATION_COMPLETE**: Target Grade A reached in ${iteration} iterations.`);
                break;
            }

            if (iteration === MAX_ITERATIONS) {
                chat(`⚠️ **LIMIT_REACHED**: Max iterations (${MAX_ITERATIONS}) met. Final Grade: ${updatedAsset.grade || 'N/A'}.`);
                break;
            }

            // 3. Improve Prompt based on feedback
            chat(`🔄 **ITERATING**: Grade ${updatedAsset.grade} detected. Refining prompt for better CTR...`);
            
            const promptData = await fetchOpenRouter({
                model: 'google/gemma-4-31b-it:free',
                messages: [
                    { role: 'system', content: `You are an expert prompt engineer. Improve this image prompt based on feedback to reach Grade A clickability.` },
                    { role: 'user', content: `Original Prompt: ${currentPrompt}\nFeedback: ${updatedAsset.analysis?.feedback || 'Increase contrast and subject focus.'}\nImprovements: ${updatedAsset.analysis?.improvements?.join(', ') || ''}` }
                ]
            });
            
            currentPrompt = promptData.choices?.[0]?.message?.content || currentPrompt;
        }
        
        setStatus(prev => ({ ...prev, loopIteration: 0 }));
    };

    const runViralBreakdown = async (url) => {
        if (!user || !currentProject) return;
        setStatus(prev => ({ ...prev, isTyping: true }));

        try {
            const data = await fetchOpenRouter({
                model: 'google/gemma-4-31b-it:free',
                messages: [
                    { role: 'system', content: `You are SYNTHESIS Viral Auditor. Analyze the provided URL strategy. 
                    Structure your response as:
                    ### ⚡ THE HOOK
                    Explain why the first 3 seconds work.
                    
                    ### 🏗️ CONTENT STRUCTURE
                    Break down the pacing and retention strategy.
                    
                    ### 🎯 THUMBNAIL STRATEGY
                    Suggest how to replicate this visually.
                    
                    Use **bold highlights**. Keep it punchy and studio-grade.` },
                    { role: 'user', content: `Analyze this content strategy: ${url}` }
                ]
            });

            const reply = data.choices?.[0]?.message?.content || 'ANALYSIS_FAILED';
            const updatedMessages = [...currentProject.messages, 
                { role: 'user', content: `VIRAL_AUDIT: ${url}` },
                { role: 'assistant', content: reply }
            ];
            
            const updatedProject = { ...currentProject, messages: updatedMessages };
            setCurrentProject(updatedProject);
            await saveProject(updatedProject);
        } catch (err) {
            setError(err.message);
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };

    const deleteAsset = async (assetId) => {
        if (!currentProject) return;
        const updatedAssets = currentProject.assets.filter(a => a.id !== assetId);
        const updatedProject = { ...currentProject, assets: updatedAssets };
        setCurrentProject(updatedProject);
        if (activeAsset?.id === assetId) setActiveAsset(updatedAssets[0] || null);
        await saveProject(updatedProject);
    };

    const downloadAsset = (asset) => {
        if (!asset) return;
        const link = document.createElement('a');
        link.href = asset.url;
        link.download = `RE_RENDER_${asset.id.slice(0, 8)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const runStoryboardEngine = async (script) => {
        if (!user || !currentProject) return;
        setStatus(prev => ({ ...prev, isTyping: true }));

        try {
            // Step 1: Breakdown Script into Scenes
            const breakdownData = await fetchOpenRouter({
                model: 'google/gemma-4-31b-it:free',
                messages: [
                    { role: 'system', content: `You are a film director. Breakdown this script into 4-6 visual scenes. 
                    Return ONLY JSON: 
                    { "scenes": [
                        { "id": 1, "description": "...", "camera": "...", "emotion": "...", "imagePrompt": "..." }
                    ]}` },
                    { role: 'user', content: script }
                ]
            });

            const breakdown = safeParseJSON(breakdownData.choices?.[0]?.message?.content);
            if (!breakdown?.scenes) throw new Error("STORYBOARD_BREAKDOWN_FAILED");

            chat(`🎬 **STORYBOARD_MODE**: Broken down into ${breakdown.scenes.length} scenes. Starting visualization...`);
            
            let storyboardAssets = [];
            for (const scene of breakdown.scenes) {
                setStatus(prev => ({ ...prev, isGenerating: true }));
                const asset = await generateImage(scene.imagePrompt);
                if (asset) {
                    const finalAsset = { ...asset, sceneData: scene };
                    storyboardAssets.push(finalAsset);
                }
            }

            const updatedProject = {
                ...currentProject,
                assets: [...currentProject.assets, ...storyboardAssets]
            };
            setCurrentProject(updatedProject);
            await saveProject(updatedProject);
            
            chat(`✅ **STORYBOARD_COMPLETE**: All frames generated. Check the **SKETCHBOARD** for your visual plan.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false, isGenerating: false }));
        }
    };

    const runShortFilmGenerator = async (idea) => {
        if (!user || !currentProject) return;
        setStatus(prev => ({ ...prev, isTyping: true }));

        try {
            // Step 1: Write Script
            const scriptData = await fetchOpenRouter({
                model: 'google/gemma-4-31b-it:free',
                messages: [
                    { role: 'system', content: `You are a viral scriptwriter. Write a 30-60 second high-impact script for a short film about: ${idea}. Keep it simple and cinematic.` },
                    { role: 'user', content: idea }
                ]
            });

            const script = scriptData.choices?.[0]?.message?.content || 'SCRIPT_GEN_FAILED';
            chat(`🎬 **SHORT_FILM_SCRIPT**: \n\n${script}`);
            
            // Step 2: Pass to Storyboard Engine
            await runStoryboardEngine(script);
        } catch (err) {
            setError(err.message);
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };

    const value = {
        projects,
        currentProject,
        activeAsset,
        rightPanelTab,
        status,
        error,
        setRightPanelTab,
        setActiveAsset,
        createProject,
        loadProject,
        chat,
        generateImage,
        analyzeAsset,
        runNeuralLoop,
        runViralBreakdown,
        runStoryboardEngine,
        runShortFilmGenerator,
        deleteAsset,
        downloadAsset
    };

    return <OracleContext.Provider value={value}>{children}</OracleContext.Provider>;
};

export const useOracle = () => useContext(OracleContext);
