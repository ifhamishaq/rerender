import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('applicants');
    const [isPinAuthorized, setIsPinAuthorized] = useState(true); 

    const [creditAdjustment, setCreditAdjustment] = useState({});





    // --- Blog State Removed ---

    // --- Careers State ---
    const [careers, setCareers] = useState([]);
    const [editingCareerId, setEditingCareerId] = useState(null);
    const [careerForm, setCareerForm] = useState({
        sidemark: '', type: 'INTERNSHIP', status: 'AVAILABLE', title: '',
        serifTitle: 'The', description: '', specs: '', link: '', buttonLabel: 'APPLY_NOW', style: 'premium'
    });


 
    // --- Credit Requests State ---
    const [topupRequests, setTopupRequests] = useState([]);
 


    const [allUsers, setAllUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [portfolioForm, setPortfolioForm] = useState({
        title: '', category: 'MOTION', video_url: '', youtubeid: '', thumbnail: '', client: '', aspectratio: '16/9'
    });
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
 
    // --- Phase 6: Moderation State ---
    const [allThreads, setAllThreads] = useState([]);
 

 
    // --- Applicants State ---
    const [applicants, setApplicants] = useState([]);
    const [appFeedback, setAppFeedback] = useState({});
    const [appStatusUpdates, setAppStatusUpdates] = useState({});
 

 
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (authLoading) return; // Wait for auth to settle

        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isAdminRole = profile?.role === 'admin';
        const isOwner = isLocal || isAdminRole; 

        if (!isOwner) {
            console.log('--- ADMIN_ACCESS_DENIED ---');
            navigate('/');
            return;
        }
        
        // IF we reach here, either we are LOCAL or we are an OWNER.
        // We can safely fetch data.
        
        fetchCareers();
        fetchTopupRequests();
        fetchAllUsers();
        fetchApplicants();
        fetchSubmissions();
        fetchPortfolio();
    }, [user, authLoading]);





    // --- Careers CRUD (Migrated to Supabase) ---
    const fetchCareers = async () => {
        const { data, error } = await supabase
            .from('careers')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setCareers(data);
        if (error) console.error('Supabase Careers Error:', error);
    };

    const handleSaveCareer = async () => {
        const toSave = { 
            ...careerForm, 
            specs: typeof careerForm.specs === 'string' ? careerForm.specs.split('\n').filter(s => s.trim()) : careerForm.specs
        };
        
        let error;
        if (editingCareerId) {
            const { error: err } = await supabase
                .from('careers')
                .update(toSave)
                .eq('id', editingCareerId);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('careers')
                .insert([toSave]);
            error = err;
        }

        if (error) {
            setStatus('Error: ' + error.message);
        } else {
            setStatus('Career Listing Saved to Supabase!');
            setEditingCareerId(null);
            setCareerForm({ sidemark: '', type: 'INTERNSHIP', status: 'AVAILABLE', title: '', serifTitle: 'The', description: '', specs: '', link: '', buttonLabel: 'APPLY_NOW', style: 'premium' });
            fetchCareers();
        }
    };

    const handleDeleteCareer = async (id) => {
        if (!window.confirm('Delete this career listing?')) return;
        const { error } = await supabase.from('careers').delete().eq('id', id);
        if (error) setStatus('Error: ' + error.message);
        else { setStatus('Listing Deleted'); fetchCareers(); }
    };

    // --- Applicants CRUD ---
    const fetchApplicants = async () => {
        try {
            console.log('--- ADMIN_FETCHING_APPLICANTS ---');
            const { data, error } = await supabase
                .from('career_applications')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('SQL_ERROR_APPLICANTS:', error);
                setStatus('Applicant Fetch Failed: ' + error.message);
                throw error;
            }
            
            console.log('APPLICANTS_RECEIVED:', data?.length || 0, 'records');
            if (data) setApplicants(data);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const handleUpdateApplicantStatus = async (id, newStatus, userId, feedback = '') => {
        const { error } = await supabase
            .from('career_applications')
            .update({ 
                status: newStatus,
                feedback: feedback 
            })
            .eq('id', id);

        if (!error) {
            fetchApplicants();
            setStatus(`UPDATED_${id}_TO_${newStatus}`);
            setTimeout(() => setStatus(''), 3000);
        }
    };

    const handleDeleteApplicant = async (id) => {
        if (!window.confirm('Wipe record?')) return;
        try {
            const { error } = await supabase.from('career_applications').delete().eq('id', id);
            if (error) throw error;
            setApplicants(prev => prev.filter(a => a.id !== id));
            setStatus('Record deleted');
        } catch (err) {
            setStatus('Error deleting record');
        }
    };



    // --- Portfolio CRUD ---
    const fetchPortfolio = async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setAllProjects(data);
    };

    const handleSaveProject = async () => {
        const payload = { ...portfolioForm };
        if (!payload.title) { setStatus('Error: Title Required'); return; }

        let error;
        if (editingProjectId) {
            const { error: err } = await supabase
                .from('projects')
                .update(payload)
                .eq('id', editingProjectId);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('projects')
                .insert([payload]);
            error = err;
        }

        if (error) {
            setStatus('Error: ' + error.message);
        } else {
            setStatus(editingProjectId ? 'Project Updated!' : 'Project Added!');
            setEditingProjectId(null);
            setPortfolioForm({ title: '', category: 'MOTION', video_url: '', youtubeid: '', thumbnail: '', client: '', aspectratio: '16/9' });
            fetchPortfolio();
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Delete project from archive?')) return;
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) setStatus('Error: ' + error.message);
        else { setStatus('Project Deleted'); fetchPortfolio(); }
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        setStatus('Uploading Asset...');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `portfolio/${fileName}`;

            // We attempt to upload to 'assets' bucket. If it fails, we fall back to a generic error message.
            const { error: uploadError } = await supabase.storage
                .from('assets') 
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('assets')
                .getPublicUrl(filePath);

            setPortfolioForm(prev => ({ ...prev, [field]: publicUrl }));
            setStatus('Upload Successful!');
        } catch (err) {
            console.error('Upload Error:', err);
            setStatus('Upload Failed: Ensure "assets" bucket exists in Supabase.');
        } finally {
            setIsUploading(false);
        }
    };

    // --- Blog CRUD Removed ---




 
    // --- Credit Management CRUD ---
    const fetchTopupRequests = async () => {
        try {
            console.log('--- ADMIN_FETCHING_TOPUPS ---');
            const { data, error } = await supabase
                .from('topup_requests')
                .select(`
                    *,
                    profiles ( full_name, credits )
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('SQL_ERROR_TOPUPS:', error);
                setStatus('Topup Fetch Failed: ' + error.message);
                throw error;
            }

            console.log('TOPUPS_RECEIVED:', data?.length || 0, 'records');
            if (data) setTopupRequests(data);
        } catch (err) {
            console.error('Error fetching topups:', err);
        }
    };
 
    const handleApproveTopup = async (reqId) => {
        setStatus('Processing Approval...');
        const { error } = await supabase.rpc('approve_topup', { req_id: reqId });
        
        if (error) {
            setStatus('Error: ' + error.message);
        } else {
            setStatus('Credit Top-up Approved!');
            fetchTopupRequests();
        }
    };
 
    const handleRejectTopup = async (reqId) => {
        setStatus('Processing Rejection...');
        const { error } = await supabase.rpc('reject_topup', { req_id: reqId });
        
        if (error) {
            setStatus('Error: ' + error.message);
        } else {
            setStatus('Request Rejected.');
            fetchTopupRequests();
        }
    };
 
    // --- Phase 6: God Mode CRUD ---
    const fetchAllUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('credits', { ascending: false });
        if (data) setAllUsers(data);
    };
 

 
    const handleAdjustCredits = async (userId, amount, reason) => {
        const { error } = await supabase.rpc('admin_adjust_credits', { 
            target_user_id: userId, 
            adjustment_amount: amount,
            adj_reason: reason
        });
        if (!error) {
            setStatus(`Adjusted balance for user.`);
            fetchAllUsers();
        } else {
            setStatus('Credit Adjustment Failed: ' + error.message);
        }
    };





 
    const handleTogglePro = async (userId, proStatus) => {
        setStatus('UPDATING_PRO_STATUS...');
        const { error } = await supabase
            .from('profiles')
            .update({ is_pro: proStatus })
            .eq('id', userId);
            
        if (!error) {
            setStatus(`SUCCESS: User PRO_STATUS set to ${proStatus}`);
            fetchAllUsers();
            setTimeout(() => setStatus(''), 3000);
        } else {
            console.error('PRO_TOGGLE_ERROR:', error);
            setStatus('Error: ' + error.message + ' (Check RLS Policies)');
        }
    };

    // --- Submissions CRUD ---
    const fetchSubmissions = async () => {
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setSubmissions(data);
    };

    const handleDeleteSubmission = async (id) => {
        if (!window.confirm('Wipe lead?')) return;
        const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
        if (!error) {
            setSubmissions(prev => prev.filter(s => s.id !== id));
            setStatus('Lead deleted');
        } else {
            setStatus('Error wiping lead: ' + error.message);
        }
    };



 
 


    // --- Tab Style ---
    const tabStyle = (tab) => ({
        padding: '1rem 1.5rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: '900',
        fontSize: '0.8rem',
        border: '1px solid var(--color-border)',
        backgroundColor: activeTab === tab ? 'var(--color-accent)' : '#111',
        color: activeTab === tab ? '#000' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        textTransform: 'uppercase',
        flex: 1,
        textAlign: 'center'
    });

    const inputStyle = { 
        padding: '0.85rem', 
        fontFamily: 'var(--font-mono)', 
        border: '1px solid var(--color-border)', 
        backgroundColor: '#1a1a1a', 
        color: '#fff',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none'
    };

    const modalOverlayStyle = {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', 
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    };

    const modalContentStyle = {
        background: '#111', border: '1px solid var(--color-accent)', 
        padding: '3rem', width: '100%', maxWidth: '500px', boxShadow: '0 0 50px rgba(0,255,157,0.1)'
    };

    const sectionBox = {
        padding: '2rem',
        backgroundColor: '#0a0a0a',
        border: '1px solid var(--color-border)',
        marginBottom: '2rem'
    };

    const buttonStyle = {
        padding: '1rem',
        backgroundColor: 'var(--color-accent)',
        color: '#000',
        border: 'none',
        fontFamily: 'var(--font-mono)',
        fontWeight: '900',
        cursor: 'pointer',
        textTransform: 'uppercase'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.6rem',
        opacity: 0.5,
        marginBottom: '0.5rem',
        fontFamily: 'var(--font-mono)'
    };

    const actionBtnStyle = {
        padding: '0.5rem 1rem',
        backgroundColor: '#222',
        color: 'var(--color-accent)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900
    };

    const saveBtnStyle = {
        ...buttonStyle,
        backgroundColor: 'var(--color-accent)',
        boxShadow: '0 4px 15px rgba(57, 255, 20, 0.3)'
    };

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
            <div style={{ padding: '8rem 2rem 4rem', fontFamily: 'var(--font-mono)', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>ADMIN_CMS</h1>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)' }}>[SYSTEM_CONNECTED] [MODE: PORTAL]</div>
                </div>



                {status && (
                    <div style={{ 
                        padding: '1rem', 
                        backgroundColor: status.includes('Error') ? 'rgba(255,0,0,0.1)' : 'rgba(57, 255, 20, 0.1)', 
                        border: `1px solid ${status.includes('Error') ? 'red' : 'var(--color-accent)'}`,
                        color: status.includes('Error') ? 'red' : 'var(--color-accent)',
                        marginBottom: '2rem',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                    }}>
                        {status}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '2px', marginBottom: '2rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-border)' }}>
                    <button onClick={() => setActiveTab('applicants')} style={tabStyle('applicants')}>APPLICANTS</button>
                    <button onClick={() => setActiveTab('leads')} style={tabStyle('leads')}>LEADS</button>
                    <button onClick={() => setActiveTab('careers')} style={tabStyle('careers')}>CAREERS</button>
                    <button onClick={() => setActiveTab('portfolio')} style={tabStyle('portfolio')}>PORTFOLIO</button>
                    <button onClick={() => setActiveTab('credits')} style={tabStyle('credits')}>CREDITS</button>
                    <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>USERS</button>
                </div>


 
                {/* ===== LEADS TAB ===== */}
                {activeTab === 'leads' && (
                    <div style={sectionBox}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            PROJECT_LEADS_&_ESTIMATES
                            <button onClick={fetchSubmissions} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.7rem' }}>[REFRESH]</button>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {submissions.length > 0 ? submissions.map(s => (
                                <div key={s.id} style={{ padding: '1.5rem', border: '1px solid var(--color-border)', backgroundColor: '#111' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{s.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>{s.email}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>{s.estimate}</div>
                                            <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>{new Date(s.created_at).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: '#050505', border: '1px solid #1a1a1a', fontSize: '0.7rem' }}>
                                        <div><span style={{ opacity: 0.5 }}>CATEGORY:</span><br/>{s.category?.toUpperCase()}</div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <span style={{ opacity: 0.5 }}>PROJECT_DETAILS:</span><br/>
                                            <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{s.quantity_duration}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleDeleteSubmission(s.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 900 }}>[WIPE_LEAD]</button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3 }}>NO_LEADS_FOUND</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== CAREERS TAB ===== */}
                {activeTab === 'careers' && (
                    <div style={sectionBox}>
                        <h2 style={{ marginBottom: '2rem' }}>CAREERS_MANAGEMENT</h2>
                        
                        <div style={{ backgroundColor: '#050505', padding: '2rem', border: '1px solid var(--color-border)', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '0.8rem', marginBottom: '1.5rem', opacity: 0.5 }}>{editingCareerId ? 'EDIT_CAREER_LISTING' : 'ADD_NEW_CAREER'}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>TITLE</label>
                                    <input value={careerForm.title} onChange={e => setCareerForm({...careerForm, title: e.target.value})} style={inputStyle} placeholder="Art Director" />
                                </div>
                                <div>
                                    <label style={labelStyle}>TYPE</label>
                                    <select value={careerForm.type} onChange={e => setCareerForm({...careerForm, type: e.target.value})} style={inputStyle}>
                                        <option value="FULL-TIME">FULL-TIME</option>
                                        <option value="PART-TIME">PART-TIME</option>
                                        <option value="CONTRACT">CONTRACT</option>
                                        <option value="INTERNSHIP">INTERNSHIP</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>STATUS</label>
                                    <select value={careerForm.status} onChange={e => setCareerForm({...careerForm, status: e.target.value})} style={inputStyle}>
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="CLOSED">CLOSED</option>
                                        <option value="HIDDEN">HIDDEN</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>SIDEMARK</label>
                                    <input value={careerForm.sidemark} onChange={e => setCareerForm({...careerForm, sidemark: e.target.value})} style={inputStyle} placeholder="Vol. 01" />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>DESCRIPTION</label>
                                    <textarea value={careerForm.description} onChange={e => setCareerForm({...careerForm, description: e.target.value})} style={{...inputStyle, minHeight: '100px'}} placeholder="What is this role about?" />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>SPECS (One per line)</label>
                                    <textarea value={Array.isArray(careerForm.specs) ? careerForm.specs.join('\n') : careerForm.specs} onChange={e => setCareerForm({...careerForm, specs: e.target.value})} style={{...inputStyle, minHeight: '100px'}} placeholder="3+ Years Experience&#10;C4D / Octane Expert" />
                                </div>
                            </div>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button onClick={handleSaveCareer} style={{ ...saveBtnStyle, flex: 1 }}>{editingCareerId ? 'UPDATE_LISTING' : 'PUBLISH_LISTING'}</button>
                                {editingCareerId && <button onClick={() => { setEditingCareerId(null); setCareerForm({ sidemark: '', type: 'INTERNSHIP', status: 'AVAILABLE', title: '', serifTitle: 'The', description: '', specs: '', link: '', buttonLabel: 'APPLY_NOW', style: 'premium' }); }} style={{ background: '#222', border: 'none', color: '#fff', padding: '0 2rem', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {careers.map(c => (
                                <div key={c.id} style={{ border: '1px solid var(--color-border)', backgroundColor: '#0a0a0a', padding: '1.5rem' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{c.type} // {c.status}</div>
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '1rem' }}>{c.title}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <button onClick={() => { setEditingCareerId(c.id); setCareerForm(c); window.scrollTo(0, 0); }} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.65rem' }}>[EDIT]</button>
                                        <button onClick={() => handleDeleteCareer(c.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.65rem' }}>[WIPE]</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
 

 

 

 
                {/* ===== PORTFOLIO TAB ===== */}
                {activeTab === 'portfolio' && (
                    <div style={sectionBox}>
                        <h2 style={{ marginBottom: '2rem' }}>PORTFOLIO_ENGINE</h2>
                        
                        {/* Add/Edit Form */}
                        <div style={{ backgroundColor: '#050505', padding: '2rem', border: '1px solid var(--color-border)', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '0.8rem', marginBottom: '1.5rem', opacity: 0.5 }}>{editingProjectId ? 'EDIT_EXISTING_PROJECT' : 'ADD_NEW_PROJECT'}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>TITLE</label>
                                    <input value={portfolioForm.title} onChange={e => setPortfolioForm({...portfolioForm, title: e.target.value})} style={inputStyle} placeholder="Project Name" />
                                </div>
                                <div>
                                    <label style={labelStyle}>CATEGORY</label>
                                    <select value={portfolioForm.category} onChange={e => setPortfolioForm({...portfolioForm, category: e.target.value})} style={inputStyle}>
                                        <option value="MOTION">MOTION</option>
                                        <option value="CGI">CGI</option>
                                        <option value="WEB">WEB</option>
                                        <option value="AI">AI</option>
                                        <option value="BRANDING">BRANDING</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>CLIENT</label>
                                    <input value={portfolioForm.client} onChange={e => setPortfolioForm({...portfolioForm, client: e.target.value})} style={inputStyle} placeholder="Optional" />
                                </div>
                                <div>
                                    <label style={labelStyle}>ASPECT_RATIO</label>
                                    <select value={portfolioForm.aspectratio} onChange={e => setPortfolioForm({...portfolioForm, aspectratio: e.target.value})} style={inputStyle}>
                                        <option value="16/9">16/9 (Widescreen)</option>
                                        <option value="9/16">9/16 (Vertical)</option>
                                        <option value="1/1">1/1 (Square)</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>THUMBNAIL_URL / FILE</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input value={portfolioForm.thumbnail} onChange={e => setPortfolioForm({...portfolioForm, thumbnail: e.target.value})} style={{...inputStyle, flex: 1}} placeholder="https://..." />
                                        <input type="file" onChange={e => handleFileUpload(e, 'thumbnail')} style={{ display: 'none' }} id="thumb-upload" />
                                        <label htmlFor="thumb-upload" style={{ ...actionBtnStyle, whiteSpace: 'nowrap' }}>{isUploading ? '...' : '[UPLOAD]'}</label>
                                    </div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>VIDEO_URL / YT_ID</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input value={portfolioForm.video_url} onChange={e => setPortfolioForm({...portfolioForm, video_url: e.target.value})} style={{...inputStyle, flex: 1}} placeholder="Direct MP4 URL" />
                                        <input value={portfolioForm.youtubeid} onChange={e => setPortfolioForm({...portfolioForm, youtubeid: e.target.value})} style={{...inputStyle, width: '150px'}} placeholder="YouTube ID" />
                                        <input type="file" onChange={e => handleFileUpload(e, 'video_url')} style={{ display: 'none' }} id="video-upload" />
                                        <label htmlFor="video-upload" style={{ ...actionBtnStyle, whiteSpace: 'nowrap' }}>[UPLOAD_MP4]</label>
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button onClick={handleSaveProject} style={{ ...saveBtnStyle, flex: 1 }}>{editingProjectId ? 'PUSH_UPDATES' : 'EXECUTE_DEPLOY'}</button>
                                {editingProjectId && <button onClick={() => { setEditingProjectId(null); setPortfolioForm({ title: '', category: 'MOTION', video_url: '', youtubeid: '', thumbnail: '', client: '', aspectratio: '16/9' }); }} style={{ background: '#222', border: 'none', color: '#fff', padding: '0 2rem', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>}
                            </div>
                        </div>

                        {/* Projects List */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {allProjects.map(p => (
                                <div key={p.id} style={{ border: '1px solid var(--color-border)', backgroundColor: '#0a0a0a', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ width: '100%', aspectRatio: p.aspectratio === '9/16' ? '9/16' : '16/9', backgroundColor: '#000', backgroundImage: `url(${p.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div style={{ padding: '1rem', flex: 1 }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '0.25rem' }}>{p.category}</div>
                                        <div style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '1rem' }}>{p.title}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <button onClick={() => { setEditingProjectId(p.id); setPortfolioForm(p); window.scrollTo(0, 0); }} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.65rem' }}>[EDIT]</button>
                                            <button onClick={() => handleDeleteProject(p.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.65rem' }}>[WIPE]</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== CREDITS TAB ===== */}
                {activeTab === 'credits' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                PENDING_TOPUP_REQUESTS
                                <button onClick={fetchTopupRequests} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.7rem' }}>[REFRESH]</button>
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {topupRequests.length > 0 ? topupRequests.map(req => (
                                    <div key={req.id} style={{ 
                                        padding: '1.5rem', 
                                        border: '1px solid var(--color-border)', 
                                        backgroundColor: '#111', 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 900, marginBottom: '0.3rem' }}>
                                                {req.profiles?.full_name || 'USER_ID: ' + req.user_id.slice(0, 8)} 
                                                <span style={{ color: 'var(--color-accent)', marginLeft: '1rem' }}>+{req.amount} CR</span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                                TX_ID: <span style={{ color: '#fff' }}>{req.transaction_id}</span> | 
                                                DATE: {new Date(req.created_at).toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.3rem' }}>
                                                CURRENT_BALANCE: {req.profiles?.credits || 0} CR
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => handleApproveTopup(req.id)}
                                                style={{ ...buttonStyle, padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}
                                            >
                                                APPROVE
                                            </button>
                                            <button 
                                                onClick={() => handleRejectTopup(req.id)}
                                                style={{ ...buttonStyle, backgroundColor: '#333', color: '#ff4444', padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}
                                            >
                                                REJECT
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3 }}>NO_PENDING_REQUESTS</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
 
                {/* ===== USERS TAB ===== */}
                {activeTab === 'users' && (
                    <div style={sectionBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>USER_CONTROL_HUB</h2>
                        </div>
                        <input 
                            placeholder="SEARCH_BY_EMAIL_OR_NAME" 
                            value={userSearch} 
                            onChange={e => setUserSearch(e.target.value)} 
                            style={{ ...inputStyle, marginBottom: '1.5rem' }} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {allUsers
                                .filter(u => u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()))
                                .map(u => (
                                <div key={u.id} style={{ padding: '1.5rem', border: '1px solid var(--color-border)', backgroundColor: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 900, marginBottom: '0.2rem' }}>
                                            {u.full_name || 'NO_NAME'} 
                                            {u.is_pro && <span style={{ color: 'var(--color-accent)', fontSize: '0.6rem', marginLeft: '0.5rem' }}>[PRO]</span>}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{u.email}</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 900, marginTop: '0.5rem', display: 'flex', gap: '1.5rem' }}>
                                            <span>COMPUTE: {u.credits || 0} CR</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end', maxWidth: '350px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#050505', padding: '0.5rem', border: '1px solid #1a1a1a' }}>
                                            <input 
                                                type="number" 
                                                placeholder="± AMOUNT" 
                                                value={creditAdjustment[u.id] || ''} 
                                                onChange={e => setCreditAdjustment({...creditAdjustment, [u.id]: e.target.value})}
                                                style={{ ...inputStyle, width: '80px', padding: '0.4rem', fontSize: '0.7rem' }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    handleAdjustCredits(u.id, parseInt(creditAdjustment[u.id]), 'MANUAL_ADMIN_ADJUST');
                                                    setCreditAdjustment({...creditAdjustment, [u.id]: ''});
                                                }} 
                                                style={{ ...buttonStyle, padding: '0.4rem 1rem', fontSize: '0.6rem' }}
                                            >
                                                ADJUST
                                            </button>
                                        </div>
                                        
                                        <button onClick={() => handleTogglePro(u.id, !u.is_pro)} style={{ ...buttonStyle, backgroundColor: u.is_pro ? '#ff4444' : 'var(--color-accent)', padding: '0.75rem 1rem', fontSize: '0.6rem' }}>
                                            {u.is_pro ? 'STRIP_PRO' : 'GRANT_PRO'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
 

                {/* ===== APPLICANTS TAB ===== */}
                {activeTab === 'applicants' && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Incoming Applications</h2>
                            <button onClick={fetchApplicants} style={{ ...buttonStyle, padding: '0.5rem 1rem', fontSize: '0.7rem' }}>REFRESH</button>
                        </div>
                        {applicants.filter(app => app.status === 'NEW' || app.status === 'REVIEWING').length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--color-border)', opacity: 0.5 }}>[NO_PENDING_APPLICATIONS]</div>
                        ) : (
                            applicants.filter(app => app.status === 'NEW' || app.status === 'REVIEWING').map(app => (
                                <div key={app.id} style={{ ...sectionBox, marginBottom: '0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>{app.full_name}</h3>
                                                <span style={{ 
                                                    fontSize: '0.6rem', padding: '2px 8px', borderRadius: '100px',
                                                    backgroundColor: app.status === 'NEW' ? 'var(--color-accent)' : '#222',
                                                    color: app.status === 'NEW' ? '#000' : '#fff',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                                {app.email} | <span style={{ color: 'var(--color-accent)' }}>{app.primary_role || app.role_title}</span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                                                LOCATION: {app.location_timezone || 'NOT_SPECIFIED'} | DISCORD: {app.discord_id || 'NONE'}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.3 }}>{new Date(app.created_at).toLocaleDateString()}</div>
                                    </div>
 
                                    <div style={{ backgroundColor: '#111', padding: '1rem', border: '1px solid #222', marginBottom: '1.5rem' }}>
                                        <label style={{ fontSize: '0.5rem', opacity: 0.4, display: 'block', marginBottom: '0.5rem' }}>PORTFOLIO_DOCKET</label>
                                        <a href={app.portfolio_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline', fontSize: '0.9rem' }}>{app.portfolio_url}</a>
                                    </div>

                                    {(app.software_proficiency) && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ fontSize: '0.5rem', opacity: 0.4, display: 'block', marginBottom: '0.5rem' }}>TECH_STACK_/_PROFICIENCY</label>
                                            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.8, color: 'var(--color-accent)' }}>{app.software_proficiency}</p>
                                        </div>
                                    )}

                                    {(app.why_rerender || app.message) && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ fontSize: '0.5rem', opacity: 0.4, display: 'block', marginBottom: '0.5rem' }}>VIBE_CHECK_/_MOTIVATION</label>
                                            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.8 }}>{app.why_rerender || app.message}</p>
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ fontSize: '0.5rem', opacity: 0.4, display: 'block', marginBottom: '0.5rem' }}>INTERNAL_FEEDBACK_/_RESPONSE</label>
                                        <textarea 
                                            placeholder="Enter feedback for the applicant..." 
                                            value={appFeedback[app.id] || app.feedback || ''} 
                                            onChange={e => setAppFeedback({...appFeedback, [app.id]: e.target.value})}
                                            style={{ ...inputStyle, minHeight: '80px', fontSize: '0.8rem' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #222', paddingTop: '1.5rem' }}>
                                        <select 
                                            value={appStatusUpdates[app.id] || app.status} 
                                            onChange={(e) => setAppStatusUpdates({...appStatusUpdates, [app.id]: e.target.value})}
                                            style={{ ...inputStyle, width: 'auto', flex: 1, padding: '0.5rem' }}
                                        >
                                            <option value="NEW">MARK_NEW</option>
                                            <option value="REVIEWING">REVIEWING</option>
                                            <option value="ACCEPTED">ACCEPTED</option>
                                            <option value="REJECTED">REJECTED</option>
                                        </select>
                                        <button 
                                            onClick={() => handleUpdateApplicantStatus(app.id, appStatusUpdates[app.id] || app.status, app.user_id, appFeedback[app.id] || app.feedback)}
                                            style={{ ...buttonStyle, padding: '0.5rem 1.5rem', fontSize: '0.7rem' }}
                                        >
                                            UPDATE_STATUS
                                        </button>
                                        <button onClick={() => handleDeleteApplicant(app.id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#333', color: '#ff4444', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>WIPE</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Admin;

