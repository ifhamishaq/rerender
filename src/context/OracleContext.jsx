import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { fetchOpenRouter, safeParseJSON } from '../utils/ai';

const OracleContext = createContext();

export const OracleProvider = ({ children }) => {
    const { user, spendCredits } = useAuth();
    
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

    const loadProject = (project) => {
        const cleanedProject = {
            ...project,
            messages: project.messages.map(m => ({ ...m, isNew: false }))
        };
        setCurrentProject(cleanedProject);
    };

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
            const newMsg = { ...msg, isNew: true };
            const updated = { ...prev, messages: [...prev.messages, newMsg] };
            saveProject(updated);
            return updated;
        });
    };

    // --- Core AI: Fallback Wrapper ---
    const fetchWithFallback = async (messages) => {
        const primaryModel = 'openrouter/free'; // Always fast
        
        try {
            // Give primary model a 15-second timeout
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000));
            const data = await Promise.race([
                fetchOpenRouter({ model: primaryModel, messages }),
                timeoutPromise
            ]);
            return data;
        } catch (err) {
            console.warn(`[ORACLE] ${primaryModel} failed/timed out. Retrying...`, err);
            return await fetchOpenRouter({ model: primaryModel, messages });
        }
    };

    // --- Core AI: Chat ---

    const chat = async (messageText, imageUrl = null) => {
        if (!currentProject || !user) return;
        
        const success = await spendCredits(1, 'ORACLE_CHAT');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** Standard chat costs 1 credit. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isTyping: true }));

        const userMsg = { role: 'user', type: imageUrl ? 'image_upload' : 'text', content: messageText, image: imageUrl };
        const updatedMessages = [...currentProject.messages, userMsg];
        setCurrentProject(prev => ({ ...prev, messages: updatedMessages }));

        try {
            const apiMessages = imageUrl ? [
                { role: 'system', content: `You are Oracle, the creative intelligence built exclusively by RE-RENDER Studio. Analyze the uploaded image and respond helpfully. Use simple English.` },
                { role: 'user', content: [
                    { type: 'text', text: messageText },
                    { type: 'image_url', image_url: { url: imageUrl } }
                ]}
            ] : [
                { role: 'system', content: `🧠 Oracle 2.0 — Master System Prompt
You are Oracle, the creative intelligence 
built exclusively by RE-RENDER Studio.

IDENTITY:
You are not a generic AI assistant.
You are a specialist in one domain:
helping creators, filmmakers, and brands
produce content that performs.
You think like a creative director,
strategize like a YouTube growth expert,
and execute like a senior video producer.

PERSONALITY:
- Direct and confident, never vague
- Use simple English, no unnecessary jargon
- Bold key insights using **markdown**
- Highlight critical terms in RE-RENDER 
  accent color where supported
- Never say "I think" or "perhaps"
  Speak with authority
- Keep responses concise but complete
- No filler phrases like "Great question!"
  Just answer immediately

CORE EXPERTISE:
1. YouTube content strategy and viral growth
2. Thumbnail design and CTR optimization  
3. Short film and video script writing
4. Storyboard direction and visual planning
5. Hook writing and retention engineering
6. Brand identity for content creators

RESPONSE RULES:
- Always lead with the most important insight
- Use structured formatting for complex answers
- When analyzing content, be brutally honest
- When generating creative work, be bold
- Never produce generic or safe creative work
- Push for originality in every output

CONTEXT AWARENESS:
- You remember the full conversation history
- You build on previous responses intelligently
- You never repeat information already given
- You adapt tone based on what the user needs
  (strategic vs creative vs technical)

ORACLE'S MISSION:
Every creator who talks to you should leave
with something they couldn't have built alone.
Not generic advice. Not safe suggestions.
Real strategic and creative firepower that
gives RE-RENDER Studio clients an unfair
advantage over their competition.

You are Oracle. Built by RE-RENDER.
You exist to make content that dominates.` },
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
        
        const success = await spendCredits(10, 'ORACLE_IMAGE_GEN');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** Image generation costs 10 credits. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isGenerating: true }));
        
        addMessage({ role: 'assistant', type: 'text', content: `Generating image: "${prompt}"...` });

        try {
            const response = await fetch('/.netlify/functions/generate-wallpaper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, width: 1024, height: 1024 })
            });
            const data = await response.json();
            
            let finalUrl = data.url || (data.images && data.images[0]?.url) || data.output || data[0]?.url;
            
            if (finalUrl) {
                const imageMsg = {
                    role: 'assistant',
                    type: 'image',
                    content: prompt,
                    url: finalUrl,
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString()
                };
                addMessage(imageMsg);
                return imageMsg;
            } else {
                throw new Error("No image URL returned from generator.");
            }
        } catch (err) {
            console.error(err);
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **GENERATION_FAILED:** Could not generate image. Please try again.` });
        } finally {
            setStatus(prev => ({ ...prev, isGenerating: false }));
        }
    };

    // --- Core AI: Analyze Image ---

    const analyzeImage = async (imageUrl) => {
        if (!user || !currentProject) return;
        
        const success = await spendCredits(10, 'ORACLE_THUMBNAIL_GRADE');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** Thumbnail Grading costs 10 credits. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isAnalyzing: true }));

        try {
            const data = await fetchOpenRouter({
                model: 'openrouter/free',
                messages: [
                    { role: 'system', content: `You are a senior thumbnail strategist.
Analyze this thumbnail with the eye of
someone who has studied 10,000 thumbnails.
Return ONLY valid JSON:
{
  "grade": "S|A|B|C|D",
  "estimated_ctr": "X.X%",
  "first_impression": "What the eye sees first",
  "emotional_response": "How it makes you feel",
  "strengths": ["..."],
  "critical_fixes": ["..."],
  "neural_prompt": "Rewritten image prompt that fixes every weakness identified"
}
Grade S = top 1% of thumbnails.
Be honest. Most thumbnails are C tier.` },
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
        
        const success = await spendCredits(25, 'ORACLE_STORYBOARD');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** Storyboard generation costs 25 credits. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isTyping: true }));

        addMessage({ role: 'assistant', type: 'text', content: 'Breaking down your script into visual scenes...' });

        try {
            const breakdownData = await fetchWithFallback([
                { role: 'system', content: `You are a film director breaking down
a script for production. Analyze the
script and extract 4-6 distinct visual
moments that tell the complete story.
Return ONLY valid JSON:
{
  "scenes": [
    {
      "id": 1,
      "title": "Scene Title",
      "description": "What happens visually",
      "camera": "Camera angle and movement",
      "emotion": "Emotional tone of scene",
      "lighting": "Lighting style and mood",
      "imagePrompt": "Detailed visual for sketch"
    }
  ]
}
Choose scenes for maximum visual impact.
Not every plot beat. The KEY moments.` },
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
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: initialScenes[i].imagePrompt + ', storyboard pencil sketch style, rough draft, black and white illustration, outline drawing, cinematic composition', width: 1024, height: 576 })
                    });
                    const data = await response.json();
                    
                    let finalUrl = data.url || (data.images && data.images[0]?.url) || data.output || data[0]?.url;
                    
                    if (finalUrl) {
                        initialScenes[i].imageUrl = finalUrl;
                        
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
        
        const success = await spendCredits(5, 'ORACLE_SHORT_FILM');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** This action costs 5 credits. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isTyping: true }));

        addMessage({ role: 'assistant', type: 'text', content: `Writing a ${duration} script about "${idea}" in ${style} style...` });

        try {
            const scriptData = await fetchWithFallback([
                { role: 'system', content: `You are a cinematic scriptwriter for 
RE-RENDER Studio. Write a ${duration} 
short film script in ${style} style.
Every scene must be visual, not verbal.
Show don't tell. Write for a camera,
not a reader. Format cleanly with
SCENE, ACTION, and DIALOGUE blocks.
Make the opening 10 seconds impossible
to look away from.` },
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
        
        const success = await spendCredits(5, 'ORACLE_VIRAL_AUDIT');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** This action costs 5 credits. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isTyping: true }));

        addMessage({ role: 'user', type: 'text', content: `Analyze this: ${url}` });

        try {
            const data = await fetchWithFallback([
                { role: 'system', content: `You are a YouTube growth strategist with
deep expertise in retention and virality.
Analyze this content idea or URL with
brutal honesty. Structure your response:

**THE HOOK** — Why it grabs in 3 seconds
**RETENTION ARCHITECTURE** — How to keep
viewers watching till the end
**THUMBNAIL STRATEGY** — The exact visual
concept that makes someone click
**TITLE FORMULA** — The psychological 
trigger that drives curiosity
**WEAK POINTS** — What could kill performance
and exactly how to fix it

Be specific. No generic advice.` },
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

    // --- Intelligent Rewriter ---
    const runRewriter = async (input) => {
        if (!user || !currentProject) return;
        
        const success = await spendCredits(5, 'ORACLE_REWRITER');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** This action costs 5 credits. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isTyping: true }));
        addMessage({ role: 'user', type: 'text', content: `Rewrite/Optimize: ${input}` });

        try {
            const data = await fetchWithFallback([
                { role: 'system', content: `You are an elite YouTube copywriter. Analyze the user's input:
- If it's a broad topic, generate 10 highly clickable titles and 3 video hooks.
- If it's an opening hook/line, rewrite it 5 ways (curiosity, fear, story, data, controversial).
- If it's bullet points, write a full SEO YouTube description with timestamps.
- Otherwise, radically improve the text for maximum retention and click-through rate.
Use simple English. Be bold. Do not use generic clickbait.` },
                { role: 'user', content: input }
            ]);
            addMessage({ role: 'assistant', type: 'text', content: data.choices?.[0]?.message?.content || 'Rewrite failed.' });
        } catch (err) {
            console.error(err);
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **NETWORK_CONGESTION:** Rewrite failed. Please try again.` });
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };

    // --- Client Proposal Generator ---
    const runProposalGenerator = async (input) => {
        if (!user || !currentProject) return;
        
        const success = await spendCredits(5, 'ORACLE_PROPOSAL');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** This action costs 5 credits. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isTyping: true }));
        addMessage({ role: 'user', type: 'text', content: `Generate proposal for: ${input}` });

        try {
            const data = await fetchWithFallback([
                { role: 'system', content: `You are a senior creative freelancer. Write a high-converting, professional client proposal. Include Project Scope, Timeline, Pricing Breakdown (anchored to the given rate), and standard payment terms.` },
                { role: 'user', content: `Client Details: ${input}` }
            ]);
            addMessage({ role: 'assistant', type: 'text', content: data.choices?.[0]?.message?.content || 'Generation failed.' });
        } catch (err) {
            console.error(err);
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **NETWORK_CONGESTION:** Generation failed. Please try again.` });
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };

    // --- 30-Day Content Calendar ---
    const runContentCalendar = async (input) => {
        if (!user || !currentProject) return;
        
        const success = await spendCredits(5, 'ORACLE_CALENDAR');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** This action costs 5 credits. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isTyping: true }));
        addMessage({ role: 'user', type: 'text', content: `Generate 30-day calendar for: ${input}` });

        try {
            const data = await fetchWithFallback([
                { role: 'system', content: `You are a YouTube Content Strategist. Map out a 30-day content calendar designed to maximize returning viewers. Include 1 hero video, 3 standard videos, and Shorts ideas.` },
                { role: 'user', content: `Niche & Goals: ${input}` }
            ]);
            addMessage({ role: 'assistant', type: 'text', content: data.choices?.[0]?.message?.content || 'Generation failed.' });
        } catch (err) {
            console.error(err);
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **NETWORK_CONGESTION:** Generation failed. Please try again.` });
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };

    // --- Client Brief Extractor ---
    const runBriefExtractor = async (messyBrief) => {
        if (!user || !currentProject) return;
        
        const success = await spendCredits(5, 'ORACLE_BRIEF');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** This action costs 5 credits. Please recharge your account.` });
            return;
        }
        
        setStatus(prev => ({ ...prev, isTyping: true }));
        addMessage({ role: 'user', type: 'text', content: `Extract brief from: \n\n${messyBrief}` });

        try {
            const data = await fetchWithFallback([
                { role: 'system', content: `You are a project manager. Extract the scattered information from this client message into a clean brief: Tone, Style, Key Deliverables, Deadlines, and 'Things to Avoid'.` },
                { role: 'user', content: `Messy Message: ${messyBrief}` }
            ]);
            addMessage({ role: 'assistant', type: 'text', content: data.choices?.[0]?.message?.content || 'Extraction failed.' });
        } catch (err) {
            console.error(err);
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **NETWORK_CONGESTION:** Extraction failed. Please try again.` });
        } finally {
            setStatus(prev => ({ ...prev, isTyping: false }));
        }
    };



    // --- Neural Loop ---

    const runNeuralLoop = async (prompt) => {
        if (!user || !currentProject) return;
        
        const success = await spendCredits(50, 'ORACLE_NEURAL_LOOP');
        if (!success) {
            addMessage({ role: 'assistant', type: 'text', content: `🚨 **INSUFFICIENT CREDITS:** The Neural Loop costs 50 credits to execute. Please recharge your account.` });
            return;
        }
        
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
        runStoryboardEngine, runShortFilmGenerator, runViralBreakdown, runNeuralLoop,
        runRewriter, runProposalGenerator, runContentCalendar, runBriefExtractor
    };

    return <OracleContext.Provider value={value}>{children}</OracleContext.Provider>;
};

export const useOracle = () => useContext(OracleContext);
