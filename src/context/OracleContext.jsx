import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { fetchOpenRouter, safeParseJSON } from '../utils/ai';

const OracleContext = createContext();

export const OracleProvider = ({ children }) => {
    const { user } = useAuth();
    
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [status, setStatus] = useState({ isTyping: false, isGenerating: false, isAnalyzing: false });
    const [error, setError] = useState(null);

    // --- Persistence ---

    const fetchProjects = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('oracle_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('last_active', { ascending: false });
            if (data) setProjects(data);
            if (error) console.warn('[ORACLE_DB]', error.message);
        } catch (err) {
            console.error('[ORACLE_FETCH]', err);
        }
    }, [user]);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const saveProject = async (project) => {
        if (!user || !project) return;
        const { error } = await supabase
            .from('oracle_sessions')
            .upsert({
                id: project.id,
                user_id: user.id,
                title: project.title,
                messages: project.messages,
                assets: project.assets || [],
                last_active: new Date().toISOString()
            });
        if (error) console.error('[ORACLE_SAVE]', error);
        fetchProjects();
    };

    // --- Project Management ---

    const createProject = async (title = 'New Chat') => {
        const newProject = {
            id: crypto.randomUUID(),
            title,
            messages: [{ role: 'assistant', type: 'text', content: 'Hey! I am Oracle, your creative partner. What are we building today?' }],
            assets: []
        };
        setCurrentProject(newProject);
        await saveProject(newProject);
    };

    const loadProject = (project) => setCurrentProject(project);

    const renameProject = async (projectId, newTitle) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, title: newTitle } : p));
        if (currentProject?.id === projectId) setCurrentProject(prev => ({ ...prev, title: newTitle }));
        await supabase.from('oracle_sessions').update({ title: newTitle }).eq('id', projectId);
    };

    const deleteProject = async (projectId) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (currentProject?.id === projectId) setCurrentProject(null);
        await supabase.from('oracle_sessions').delete().eq('id', projectId);
    };

    // --- Helper: Add message to current project ---

    const addMessage = (msg) => {
        setCurrentProject(prev => {
            if (!prev) return prev;
            const updated = { ...prev, messages: [...prev.messages, msg] };
            saveProject(updated);
            return updated;
        });
    };

    // --- Core AI: Fallback Wrapper ---
    const fetchWithFallback = async (messages, useImageModel = false) => {
        const primaryModel = useImageModel ? 'baidu/qianfan-ocr-fast:free' : 'google/gemma-4-31b-it:free';
        const fallbackModel = 'baidu/qianfan-ocr-fast:free'; // Always fast fallback

        try {
            // Give primary model a 15-second timeout
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000));
            const data = await Promise.race([
                fetchOpenRouter({ model: primaryModel, messages }),
                timeoutPromise
            ]);
            return data;
        } catch (err) {
            console.warn(`[ORACLE] ${primaryModel} failed/timed out. Shifting to fallback (${fallbackModel})...`, err);
            return await fetchOpenRouter({ model: fallbackModel, messages });
        }
    };

    // --- Core AI: Chat ---

    const chat = async (messageText, imageUrl = null) => {
        if (!currentProject || !user) return;
        setStatus(prev => ({ ...prev, isTyping: true }));

        const userMsg = { role: 'user', type: imageUrl ? 'image_upload' : 'text', content: messageText, image: imageUrl };
        const updatedMessages = [...currentProject.messages, userMsg];
        setCurrentProject(prev => ({ ...prev, messages: updatedMessages }));

        try {
            const apiMessages = imageUrl ? [
                { role: 'system', content: 'You are Oracle, a creative AI assistant. Analyze the uploaded image and respond helpfully. Use simple English.' },
                { role: 'user', content: [
                    { type: 'text', text: messageText },
                    { type: 'image_url', image_url: { url: imageUrl } }
                ]}
            ] : [
                { role: 'system', content: 'You are Oracle, a creative AI assistant built by RE-RENDER Studio. Help users create viral content, thumbnails, and creative assets. Use simple English. Use **bold** for key points. Be concise and helpful.' },
                ...updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
            ];

            const data = await fetchWithFallback(apiMessages, !!imageUrl);

            const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that. Try again.';
            const assistantMsg = { role: 'assistant', type: 'text', content: reply };
            
            const finalMessages = [...updatedMessages, assistantMsg];
            const updatedProject = { ...currentProject, messages: finalMessages };
            setCurrentProject(updatedProject);
            await saveProject(updatedProject);
        } catch (err) {
            console.error(err);
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **NETWORK_CONGESTION:** Oracle is currently experiencing high traffic (Too Many Requests). Please wait a moment and try again.` });
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };

    // --- Core AI: Generate Image ---

    const generateImage = async (prompt) => {
        if (!user || !currentProject) return;
        setStatus(prev => ({ ...prev, isGenerating: true }));
        
        addMessage({ role: 'assistant', type: 'text', content: `Generating image: "${prompt}"...` });

        try {
            const response = await fetch('/.netlify/functions/generate-wallpaper', {
                method: 'POST',
                body: JSON.stringify({ prompt, width: 1024, height: 1024 })
            });
            const data = await response.json();
            
            if (data.url) {
                const imageMsg = {
                    role: 'assistant',
                    type: 'image',
                    content: prompt,
                    url: data.url,
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString()
                };
                addMessage(imageMsg);
                return imageMsg;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setStatus(prev => ({ ...prev, isGenerating: false }));
        }
    };

    // --- Core AI: Analyze Image ---

    const analyzeImage = async (imageUrl) => {
        if (!user || !currentProject) return;
        setStatus(prev => ({ ...prev, isAnalyzing: true }));

        try {
            const data = await fetchOpenRouter({
                model: 'baidu/qianfan-ocr-fast:free',
                messages: [
                    { role: 'system', content: 'Analyze this thumbnail image. Return JSON: { "grade": "A|B|C", "ctr": "X.X%", "feedback": "...", "improvements": ["..."] }' },
                    { role: 'user', content: [{ type: 'image_url', image_url: { url: imageUrl } }] }
                ]
            });

            const analysis = safeParseJSON(data.choices?.[0]?.message?.content);
            if (analysis) {
                addMessage({ role: 'assistant', type: 'analysis', content: analysis, imageUrl });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setStatus(prev => ({ ...prev, isAnalyzing: false }));
        }
    };

    // --- Storyboard Engine ---

    const runStoryboardEngine = async (script) => {
        if (!user || !currentProject) return;
        setStatus(prev => ({ ...prev, isTyping: true }));

        addMessage({ role: 'assistant', type: 'text', content: 'Breaking down your script into visual scenes...' });

        try {
            const breakdownData = await fetchWithFallback([
                { role: 'system', content: `You are a film director. Break this script into 4-6 visual scenes. Return ONLY valid JSON:
                { "scenes": [
                    { "id": 1, "title": "Scene Title", "description": "What happens", "camera": "Camera angle/movement", "emotion": "Mood", "imagePrompt": "Detailed image generation prompt" }
                ]}` },
                { role: 'user', content: script }
            ]);

            const breakdown = safeParseJSON(breakdownData.choices?.[0]?.message?.content);
            if (!breakdown?.scenes) throw new Error('Could not break down the script. Try a simpler description.');

            addMessage({ role: 'assistant', type: 'text', content: `Found ${breakdown.scenes.length} scenes. Generating visuals now...` });

            setStatus(prev => ({ ...prev, isGenerating: true }));

            const initialScenes = breakdown.scenes.map(s => ({ ...s, imageUrl: null }));
            const msgId = crypto.randomUUID();
            
            addMessage({ id: msgId, role: 'assistant', type: 'storyboard', content: initialScenes });
            setStatus(prev => ({ ...prev, isTyping: false, isGenerating: true }));

            // Progressive Generation
            for (let i = 0; i < initialScenes.length; i++) {
                try {
                    const response = await fetch('/.netlify/functions/generate-wallpaper', {
                        method: 'POST',
                        body: JSON.stringify({ prompt: initialScenes[i].imagePrompt, width: 1024, height: 576 })
                    });
                    const data = await response.json();
                    if (data.url) {
                        initialScenes[i].imageUrl = data.url;
                        
                        // Progressive Update
                        setCurrentProject(prev => {
                            if (!prev) return prev;
                            const newMessages = prev.messages.map(m => m.id === msgId ? { ...m, content: [...initialScenes] } : m);
                            const updated = { ...prev, messages: newMessages };
                            saveProject(updated);
                            return updated;
                        });
                    }
                } catch (e) {
                    console.error("Scene Gen Error", e);
                }
            }
        } catch (err) {
            console.error(err);
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **NETWORK_CONGESTION:** Storyboard generation failed due to high traffic or rate limits. Please wait a moment and try again.` });
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false, isGenerating: false }));
        }
    };

    // --- Short Film Generator ---

    const runShortFilmGenerator = async (idea, style, duration) => {
        if (!user || !currentProject) return;
        setStatus(prev => ({ ...prev, isTyping: true }));

        addMessage({ role: 'assistant', type: 'text', content: `Writing a ${duration} script about "${idea}" in ${style} style...` });

        try {
            const scriptData = await fetchWithFallback([
                { role: 'system', content: `Write a ${duration} high-impact short film script. Style: ${style}. Keep it simple, cinematic, and visual. Use clear scene descriptions.` },
                { role: 'user', content: idea }
            ]);

            const script = scriptData.choices?.[0]?.message?.content || 'Script generation failed.';
            addMessage({ role: 'assistant', type: 'text', content: script });

            await runStoryboardEngine(script);
        } catch (err) {
            console.error(err);
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **NETWORK_CONGESTION:** Script generation failed due to high traffic or rate limits. Please try again.` });
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };

    // --- Viral Breakdown ---

    const runViralBreakdown = async (url) => {
        if (!user || !currentProject) return;
        setStatus(prev => ({ ...prev, isTyping: true }));

        addMessage({ role: 'user', type: 'text', content: `Analyze this: ${url}` });

        try {
            const data = await fetchWithFallback([
                { role: 'system', content: `You are a viral content strategist. Analyze the given URL/content idea. Structure your response as:

**The Hook** — Why the first 3 seconds work
**Content Structure** — Pacing and retention strategy  
**Thumbnail Strategy** — How to make it click-worthy

Use simple English. Be direct and helpful.` },
                { role: 'user', content: `Analyze: ${url}` }
            ]);

            const reply = data.choices?.[0]?.message?.content || 'Analysis failed.';
            addMessage({ role: 'assistant', type: 'text', content: reply });
        } catch (err) {
            console.error(err);
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **NETWORK_CONGESTION:** Analysis failed due to high traffic or rate limits. Please try again.` });
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };

    // --- Neural Loop ---

    const runNeuralLoop = async (prompt) => {
        if (!user || !currentProject) return;
        let currentPrompt = prompt;
        const MAX = 3;

        for (let i = 1; i <= MAX; i++) {
            addMessage({ role: 'assistant', type: 'text', content: `Loop ${i}/${MAX}: Generating and analyzing...` });
            
            const asset = await generateImage(currentPrompt);
            if (!asset) break;

            await analyzeImage(asset.url);

            // Check last analysis message
            const lastMsg = currentProject.messages[currentProject.messages.length - 1];
            if (lastMsg?.type === 'analysis' && lastMsg.content?.grade === 'A') {
                addMessage({ role: 'assistant', type: 'text', content: `Grade A reached in ${i} loops. Done!` });
                break;
            }

            if (i === MAX) {
                addMessage({ role: 'assistant', type: 'text', content: `Reached ${MAX} loops. Check results above.` });
                break;
            }

            // Improve prompt
            const promptData = await fetchWithFallback([
                { role: 'system', content: 'Improve this image prompt based on feedback. Reply with ONLY the improved prompt.' },
                { role: 'user', content: `Prompt: ${currentPrompt}\nFeedback: ${lastMsg?.content?.feedback || 'Make it more eye-catching'}` }
            ]);
            currentPrompt = promptData.choices?.[0]?.message?.content || currentPrompt;
        }
    };

    const value = {
        projects, currentProject, status, error,
        createProject, loadProject, renameProject, deleteProject,
        chat, generateImage, analyzeImage,
        runStoryboardEngine, runShortFilmGenerator, runViralBreakdown, runNeuralLoop
    };

    return <OracleContext.Provider value={value}>{children}</OracleContext.Provider>;
};

export const useOracle = () => useContext(OracleContext);
