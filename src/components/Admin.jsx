import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
    const { user, profile, loading: authLoading } = useAuth(); // Get profile for role check
    const [activeTab, setActiveTab] = useState('products');
    const [adminPin, setAdminPin] = useState('');
    const [isPinAuthorized, setIsPinAuthorized] = useState(() => {
        return sessionStorage.getItem('ADMIN_AUTH_L5') === 'granted';
    });

    // --- Products State ---
    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '', price: '', color: '#000000', category: 'LUTS', link: '', desc: '', image: '', type: 'PAID'
    });

    // --- Prompts State ---
    const [prompts, setPrompts] = useState([]);
    const [editingPromptId, setEditingPromptId] = useState(null);
    const [promptForm, setPromptForm] = useState({
        title: '', prompt: '', category: 'PORTRAIT', image: ''
    });

    // --- Blog State Removed ---

    // --- Careers State ---
    const [careers, setCareers] = useState([]);
    const [editingCareerId, setEditingCareerId] = useState(null);
    const [careerForm, setCareerForm] = useState({
        sidemark: '', type: 'INTERNSHIP', status: 'AVAILABLE', title: '',
        serifTitle: 'The', description: '', specs: '', link: '', buttonLabel: 'APPLY_NOW', style: 'premium'
    });

    // --- Services State ---
    const [services, setServices] = useState([]);
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        title: '', desc: '', tags: '', gif: ''
    });
 
    // --- Credit Requests State ---
    const [topupRequests, setTopupRequests] = useState([]);
 
    // --- Payout Requests State ---
    const [payoutRequests, setPayoutRequests] = useState([]);

    // --- Phase 6: All Users State ---
    const [allUsers, setAllUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [freelancerFilter, setFreelancerFilter] = useState(false);
 
    // --- Phase 6: Moderation State ---
    const [allThreads, setAllThreads] = useState([]);
 
    // --- Phase 6: Metrics State ---
    const [metrics, setMetrics] = useState({ users: 0, threads: 0, totalCredits: 0 });
 
    // --- Applicants State ---
    const [applicants, setApplicants] = useState([]);
 
    // --- Payout Ledger State ---
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [payData, setPayData] = useState({ userId: '', amount: '', project: '' });
    const [globalPayments, setGlobalPayments] = useState([]);
 
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (authLoading) return; // Wait for auth to settle

        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isOwner = profile?.role === 'admin';

        if (!isLocal && !isOwner) {
            console.log('--- ADMIN_ACCESS_DENIED ---');
            console.log('Current UID:', user?.id);
            console.log('Current Role:', profile?.role || 'user');
            console.log('To promote, run: UPDATE profiles SET role = "admin" WHERE id = "' + user?.id + '";');
            window.location.href = '/';
            return;
        }
        
        // IF we reach here, either we are LOCAL or we are an OWNER.
        // We can safely fetch data.
        
        fetchProducts();
        fetchPrompts();
        fetchCareers();
        fetchServices();
        fetchTopupRequests();
        fetchPayoutRequests();
        fetchAllUsers();
        // fetchAllThreads(); // Phase 6: Not yet implemented
        fetchMetrics();
        fetchApplicants();
        fetchGlobalPayments();
    }, [user, authLoading]);

    // --- Products CRUD ---
    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/products');
            if (!res.ok) throw new Error('OFFLINE');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.log('Local CMS server is offline. (Safe to ignore on Production)');
        }
    };

    const handleUpload = async (e, target = 'product') => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (result.url) {
                if (target === 'product') setFormData(prev => ({ ...prev, image: result.url }));
                else if (target === 'prompt') setPromptForm(prev => ({ ...prev, image: result.url }));
                setStatus('Image uploaded successfully');
            }
        } catch (err) {
            console.error(err);
            setStatus('Image upload failed');
        }
    };

    const handleTypeChange = (e) => {
        const type = e.target.value;
        setFormData(prev => ({
            ...prev,
            type,
            price: type === 'FREE' ? 'FREE' : prev.price
        }));
    };

    const handleSave = async () => {
        const productToSave = {
            ...formData,
            id: editingId || Date.now()
        };

        if (productToSave.type === 'FREE') {
            productToSave.price = 'FREE';
        }

        let updatedProducts;
        if (editingId) {
            updatedProducts = products.map(p => p.id === editingId ? productToSave : p);
        } else {
            updatedProducts = [...products, productToSave];
        }

        try {
            await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProducts)
            });
            setProducts(updatedProducts);
            setStatus('Saved successfully!');
            setEditingId(null);
            setFormData({ title: '', price: '', color: '#000000', category: 'LUTS', link: '', desc: '', image: '', type: 'PAID' });
        } catch (err) {
            setStatus('Error saving data.');
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({ ...product, type: product.price === 'FREE' ? 'FREE' : 'PAID' });
    };

    const handleDelete = async (id) => {
        const updatedProducts = products.filter(p => p.id !== id);
        try {
            await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProducts)
            });
            setProducts(updatedProducts);
            setStatus('Deleted successfully!');
        } catch (err) {
            setStatus('Error deleting.');
        }
    };

    // --- Prompts CRUD ---
    const fetchPrompts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/prompts');
            if (res.ok) {
                const data = await res.json();
                setPrompts(data);
            }
        } catch (err) {}
    };

    const handleSavePrompt = async () => {
        const promptToSave = {
            ...promptForm,
            id: editingPromptId || Date.now()
        };

        let updatedPrompts;
        if (editingPromptId) {
            updatedPrompts = prompts.map(p => p.id === editingPromptId ? promptToSave : p);
        } else {
            updatedPrompts = [...prompts, promptToSave];
        }

        try {
            await fetch('http://localhost:3001/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPrompts)
            });
            setPrompts(updatedPrompts);
            setStatus('Prompt saved!');
            setEditingPromptId(null);
            setPromptForm({ title: '', prompt: '', category: 'PORTRAIT', image: '' });
        } catch (err) {
            setStatus('Error saving prompt.');
        }
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

    const handleUpdateApplicantStatus = async (id, newStatus, targetUserId) => {
        try {
            // 1. Update Application Status
            const { error: appError } = await supabase
                .from('career_applications')
                .update({ status: newStatus })
                .eq('id', id);
            
            if (appError) throw appError;

            // 2. Automate Role Promotion if Accepted
            if (newStatus === 'ACCEPTED' && targetUserId) {
                const { error: roleError } = await supabase
                    .from('profiles')
                    .update({ role: 'freelancer' })
                    .eq('id', targetUserId);
                
                if (roleError) console.error('ROLE_PROMOTION_ERROR:', roleError);
                else setStatus('Candidate Promoted to Freelancer.');
            }

            setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            setStatus(`Applicant updated to ${newStatus}`);
        } catch (err) {
            setStatus('Error updating applicant');
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

    const handleEditPrompt = (prompt) => {
        setEditingPromptId(prompt.id);
        setPromptForm({ ...prompt });
    };

    const handleDeletePrompt = async (id) => {
        const updatedPrompts = prompts.filter(p => p.id !== id);
        try {
            await fetch('http://localhost:3001/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPrompts)
            });
            setPrompts(updatedPrompts);
            setStatus('Prompt deleted!');
        } catch (err) {
            setStatus('Error deleting prompt.');
        }
    };

    // --- Blog CRUD Removed ---

    // --- Careers CRUD ---
    const fetchCareers = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/careers');
            if (res.ok) {
                const data = await res.json();
                setCareers(data);
            }
        } catch (err) {}
    };

    const handleSaveCareer = async () => {
        const careerToSave = { 
            ...careerForm, 
            id: editingCareerId || Date.now(),
            specs: typeof careerForm.specs === 'string' ? careerForm.specs.split('\n').filter(s => s.trim()) : careerForm.specs
        };
        let updated = editingCareerId ? careers.map(c => c.id === editingCareerId ? careerToSave : c) : [...careers, careerToSave];
        try {
            await fetch('http://localhost:3001/api/careers', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            setCareers(updated); setStatus('Career saved!'); setEditingCareerId(null);
            setCareerForm({ sidemark: '', type: 'INTERNSHIP', status: 'AVAILABLE', title: '', serifTitle: 'The', description: '', specs: '', link: '', buttonLabel: 'APPLY_NOW', style: 'premium' });
        } catch (err) { setStatus('Error saving career.'); }
    };

    const handleDeleteCareer = async (id) => {
        const updated = careers.filter(c => c.id !== id);
        try {
            await fetch('http://localhost:3001/api/careers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
            setCareers(updated); setStatus('Career deleted!');
        } catch (err) { setStatus('Error deleting career.'); }
    };

    // --- Services CRUD ---
    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/services');
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (err) {}
    };

    const handleSaveService = async () => {
        const serviceToSave = { 
            ...serviceForm, 
            id: editingServiceId || Date.now(),
            tags: typeof serviceForm.tags === 'string' ? serviceForm.tags.split(',').map(t => t.trim()).filter(t => t) : serviceForm.tags
        };
        let updated = editingServiceId ? services.map(s => s.id === editingServiceId ? serviceToSave : s) : [...services, serviceToSave];
        try {
            await fetch('http://localhost:3001/api/services', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            setServices(updated); setStatus('Service saved!'); setEditingServiceId(null);
            setServiceForm({ title: '', desc: '', tags: '', gif: '' });
        } catch (err) { setStatus('Error saving service.'); }
    };

    const handleDeleteService = async (id) => {
        const updated = services.filter(s => s.id !== id);
        try {
            await fetch('http://localhost:3001/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
            setServices(updated); setStatus('Service deleted!');
        } catch (err) { setStatus('Error deleting service.'); }
    };
 
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
 
    const fetchMetrics = async () => {
        const { count: userCount } = await supabase.from('profiles', { count: 'exact', head: true }).select('*');
        const { data: creditData } = await supabase.from('profiles').select('credits');
        const totalCredits = creditData?.reduce((acc, curr) => acc + (curr.credits || 0), 0) || 0;
        
        setMetrics({
            users: userCount || 0,
            threads: 0,
            totalCredits
        });
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
            fetchMetrics();
        } else {
            setStatus('Credit Adjustment Failed: ' + error.message);
        }
    };

    const fetchPayoutRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('payout_requests')
                .select(`
                    *,
                    profiles ( full_name, role, pay_balance )
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            if (data) setPayoutRequests(data);
        } catch (err) {
            console.error('Error fetching payouts:', err);
        }
    };

    const fetchGlobalPayments = async () => {
        try {
            const { data, error } = await supabase
                .from('freelancer_payments')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            if (data) setGlobalPayments(data);
        } catch (err) {
            console.error('Error fetching global payments:', err);
        }
    };


    const handleRecordProjectPayment = async (e) => {
        e.preventDefault();
        const { error } = await supabase.rpc('record_project_payment', { 
            target_user_id: payData.userId, 
            payment_amount: parseFloat(payData.amount),
            proj_name: payData.project
        });
        
        if (!error) {
            setStatus(`Payment Recorded: $${payData.amount} for ${payData.project}.`);
            setIsPayModalOpen(false);
            setPayData({ userId: '', amount: '', project: '' });
            fetchAllUsers();
            fetchGlobalPayments();
        } else {
            console.error('PAYMENT_LEDGER_ERROR:', error);
            setStatus('Payment Failed: ' + error.message);
        }
    };

    const handleApprovePayout = async (id) => {
        setStatus('Processing Payout...');
        const { data, error } = await supabase.rpc('approve_payout', { payout_id: id });
        if (error) {
            setStatus('Payout Failed: ' + error.message);
        } else if (data) {
            setStatus('Payout Approved & Ledger Balanced.');
            fetchPayoutRequests();
            fetchAllUsers();
        }
    };

    const handleRejectPayout = async (id) => {
        const { error } = await supabase.rpc('reject_payout', { payout_id: id });
        if (!error) {
            setStatus('Payout Request Rejected.');
            fetchPayoutRequests();
        }
    };
 
    const handleTogglePro = async (userId, proStatus) => {
        const { error } = await supabase.rpc('admin_toggle_pro', { 
            target_user_id: userId, 
            pro_status: proStatus 
        });
        if (!error) {
            setStatus(`User Pro-status updated.`);
            fetchAllUsers();
        }
    };


    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'freelancer' ? 'user' : 'freelancer';
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);
            
        if (!error) {
            setStatus(`ID_${userId.slice(0,4)} role set to ${newRole.toUpperCase()}.`);
            fetchAllUsers();
        } else {
            setStatus('Role Shift Failed: ' + error.message);
        }
    };
 
 
    const handlePinVerify = async (e) => {
        e.preventDefault();
        setStatus('VERIFYING_PROTOCOL...');
        
        const { data: isValid, error } = await supabase.rpc('verify_admin_pin', { 
            input_pin: adminPin 
        });

        if (error) {
            setStatus('ACCESS_DENIED: Protocol Error (' + error.message + ')');
        } else if (isValid) {
            setIsPinAuthorized(true);
            sessionStorage.setItem('ADMIN_AUTH_L5', 'granted');
            setStatus('Level 5 Clearance Granted.');
        } else {
            setStatus('ACCESS_DENIED: Invalid PIN Syntax.');
            setAdminPin('');
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

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
            <div style={{ padding: '8rem 2rem 4rem', fontFamily: 'var(--font-mono)', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>ADMIN_CMS</h1>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)' }}>[SYSTEM_CONNECTED] [MODE: PORTAL]</div>
                </div>

                {/* ===== RECORD COMPLETION MODAL ===== */}
                {isPayModalOpen && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-accent)', marginBottom: '1.5rem', fontSize: '2rem' }}>Record_Completion</h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.5, marginBottom: '2rem' }}>
                                INJECTING_USD_INTO_LEDGER // ID: {payData.userId.slice(0,8)}
                            </p>
                            
                            <form onSubmit={handleRecordProjectPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>PROJECT_NAME / ID</label>
                                    <input 
                                        required placeholder="VFX_SCENE_01_FINAL" 
                                        value={payData.project} onChange={e => setPayData({...payData, project: e.target.value})}
                                        style={inputStyle} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>PAYMENT_AMOUNT_($USD)</label>
                                    <input 
                                        required type="number" step="0.01" placeholder="100.00" 
                                        value={payData.amount} onChange={e => setPayData({...payData, amount: e.target.value})}
                                        style={inputStyle} 
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" style={{ ...buttonStyle, flex: 1, padding: '1rem' }}>TRANSMIT_PAYMENT</button>
                                    <button type="button" onClick={() => setIsPayModalOpen(false)} style={{ ...buttonStyle, backgroundColor: '#444', padding: '1rem' }}>ABORT</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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

                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: '2px', marginBottom: '2rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-border)' }}>
                    <button onClick={() => setActiveTab('products')} style={tabStyle('products')}>SHOP</button>
                    <button onClick={() => setActiveTab('services')} style={tabStyle('services')}>SERVICES</button>
                    <button onClick={() => setActiveTab('careers')} style={tabStyle('careers')}>CAREERS</button>
                    <button onClick={() => setActiveTab('applicants')} style={tabStyle('applicants')}>APPLICANTS</button>
                    <button onClick={() => setActiveTab('prompts')} style={tabStyle('prompts')}>PROMPTS</button>
                    <button onClick={() => setActiveTab('credits')} style={tabStyle('credits')}>CREDITS</button>
                    <button onClick={() => setActiveTab('payouts')} style={tabStyle('payouts')}>PAYOUTS</button>
                    <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>USERS</button>
                    <button onClick={() => setActiveTab('metrics')} style={tabStyle('metrics')}>STATS</button>
                </div>

                {/* ===== PRODUCTS TAB ===== */}
                {activeTab === 'products' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{editingId ? 'EDIT_PRODUCT' : 'NEW_PRODUCT'}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ border: '1px dashed var(--color-border)', padding: '1rem' }}>
                                    <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>IMAGE_UPLOAD</label>
                                    <input type="file" onChange={(e) => handleUpload(e, 'product')} />
                                    {formData.image && <img src={formData.image} alt="Preview" style={{ width: '80px', marginTop: '1rem' }} />}
                                </div>
                                <input placeholder="TITLE" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <select value={formData.type} onChange={handleTypeChange} style={inputStyle}>
                                        <option value="PAID">PAID</option><option value="FREE">FREE</option>
                                    </select>
                                    <input placeholder="PRICE" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={inputStyle} disabled={formData.type === 'FREE'} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                                        <option value="LUTS">LUTS</option><option value="PACKS">PACKS</option><option value="TEXTURES">TEXTURES</option>
                                    </select>
                                    <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ ...inputStyle, padding: '2px', height: '40px' }} />
                                </div>
                                <textarea placeholder="DESCRIPTION" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />
                                <button onClick={handleSave} style={buttonStyle}>{editingId ? 'UPDATE' : 'DEPLOY'}</button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {products.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--color-border)', padding: '1.5rem', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
                                    <div><strong style={{ fontSize: '1.1rem' }}>{p.title}</strong><br/><small style={{ color: 'var(--color-text-secondary)' }}>{p.category} | {p.price}</small></div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>[EDIT]</button>
                                        <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>[DEL]</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ===== BLOG TAB REMOVED ===== */}

                {/* ===== CAREERS TAB ===== */}
                {activeTab === 'careers' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem' }}>MANAGE_OPENINGS</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="TITLE (e.g. INTERNSHIP)" value={careerForm.title} onChange={e => setCareerForm({...careerForm, title: e.target.value})} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <input placeholder="SIDEMARK (001/INT)" value={careerForm.sidemark} onChange={e => setCareerForm({...careerForm, sidemark: e.target.value})} style={inputStyle} />
                                    <select value={careerForm.status} onChange={e => setCareerForm({...careerForm, status: e.target.value})} style={inputStyle}>
                                        <option value="AVAILABLE">AVAILABLE</option><option value="SCOUTING">SCOUTING</option><option value="COMING_SOON">COMING_SOON</option>
                                    </select>
                                    <select value={careerForm.style} onChange={e => setCareerForm({...careerForm, style: e.target.value})} style={inputStyle}>
                                        <option value="premium">PREMIUM</option><option value="inverted">INVERTED</option><option value="accent">ACCENT</option>
                                    </select>
                                </div>
                                <textarea placeholder="DESCRIPTION" value={careerForm.description} onChange={e => setCareerForm({...careerForm, description: e.target.value})} style={{...inputStyle, minHeight: '80px'}} />
                                <textarea placeholder="SPECS (One per line)" value={Array.isArray(careerForm.specs) ? careerForm.specs.join('\n') : careerForm.specs} onChange={e => setCareerForm({...careerForm, specs: e.target.value})} style={{...inputStyle, minHeight: '80px'}} />
                                <button onClick={handleSaveCareer} style={buttonStyle}>SAVE_LISTING</button>
                            </div>
                        </div>
                        {careers.map(c => (
                            <div key={c.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                                <strong>{c.title}</strong> [{c.status}]
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => { setEditingCareerId(c.id); setCareerForm(c); }} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>[EDIT]</button>
                                    <button onClick={() => handleDeleteCareer(c.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>[DEL]</button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* ===== PROMPTS TAB ===== */}
                {activeTab === 'prompts' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem' }}>PROMPT_ENGINE</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="TITLE" value={promptForm.title} onChange={e => setPromptForm({ ...promptForm, title: e.target.value })} style={inputStyle} />
                                <textarea placeholder="PROMPT_TEXT" value={promptForm.prompt} onChange={e => setPromptForm({ ...promptForm, prompt: e.target.value })} style={{ ...inputStyle, minHeight: '120px' }} />
                                <button onClick={handleSavePrompt} style={buttonStyle}>SAVE_PROMPT</button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {prompts.map(p => (
                                <div key={p.id} style={{ border: '1px solid var(--color-border)', padding: '1rem' }}>
                                    <strong>{p.title}</strong>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => handleEditPrompt(p)} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>[EDIT]</button>
                                        <button onClick={() => handleDeletePrompt(p.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>[DEL]</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ===== SERVICES TAB ===== */}
                {activeTab === 'services' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem' }}>MANAGE_SERVICES</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="TITLE" value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} style={inputStyle} />
                                <input placeholder="GIF URL / PATH" value={serviceForm.gif} onChange={e => setServiceForm({...serviceForm, gif: e.target.value})} style={inputStyle} />
                                <textarea placeholder="DESCRIPTION" value={serviceForm.desc} onChange={e => setServiceForm({...serviceForm, desc: e.target.value})} style={{...inputStyle, minHeight: '80px'}} />
                                <input placeholder="TAGS (comma separated)" value={Array.isArray(serviceForm.tags) ? serviceForm.tags.join(', ') : serviceForm.tags} onChange={e => setServiceForm({...serviceForm, tags: e.target.value})} style={inputStyle} />
                                <button onClick={handleSaveService} style={buttonStyle}>SAVE_SERVICE</button>
                            </div>
                        </div>
                        {services.map(s => (
                            <div key={s.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                                <strong>{s.title}</strong>
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => { setEditingServiceId(s.id); setServiceForm(s); }} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>[EDIT]</button>
                                    <button onClick={() => handleDeleteService(s.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>[DEL]</button>
                                </div>
                            </div>
                        ))}
                    </>
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
 
                {/* ===== PAYOUTS TAB ===== */}
                {activeTab === 'payouts' && (
                    <div style={sectionBox}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            PENDING_WITHDRAWAL_REQUESTS
                            <button onClick={fetchPayoutRequests} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.7rem' }}>[REFRESH]</button>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {payoutRequests.filter(r => r.status === 'pending').length > 0 ? payoutRequests.filter(r => r.status === 'pending').map(req => (
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
                                            {req.profiles?.full_name || 'FREELANCER_NODE'} 
                                            <span style={{ color: 'var(--color-accent)', marginLeft: '1rem' }}>${req.amount} USD</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                            GATEWAY: <span style={{ color: '#fff' }}>{req.payout_method}</span> | 
                                            TARGET: <span style={{ color: '#fff' }}>{req.payout_address}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.3rem' }}>
                                            CURRENT_LEDGER_BALANCE: ${req.profiles?.pay_balance || '0.00'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => handleApprovePayout(req.id)}
                                            style={{ ...buttonStyle, padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}
                                        >
                                            APPROVE_TRANSFER
                                        </button>
                                        <button 
                                            onClick={() => handleRejectPayout(req.id)}
                                            style={{ ...buttonStyle, backgroundColor: '#333', color: '#ff4444', padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}
                                        >
                                            REJECT
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3 }}>NO_PENDING_WITHDRAWALS</div>
                            )}
                        </div>

                        {/* WITHDRAWAL_HISTORY */}
                        <div style={{ marginTop: '4rem', borderTop: '2px solid var(--color-border)', paddingTop: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                                Withdrawal_History
                                <button onClick={fetchPayoutRequests} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.7rem' }}>[REFRESH]</button>
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {payoutRequests.filter(r => r.status !== 'pending').length > 0 ? payoutRequests.filter(r => r.status !== 'pending').map(req => (
                                    <div key={req.id} style={{ 
                                        padding: '1.5rem', 
                                        border: '1px solid #222', 
                                        backgroundColor: '#0a0a0a',
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        opacity: 0.7
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 900, marginBottom: '0.3rem' }}>
                                                {req.profiles?.full_name || 'ID: ' + req.user_id.slice(0,8)} 
                                                <span style={{ color: 'var(--color-accent)', marginLeft: '1rem' }}>${req.amount} USD</span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                                DATE: {new Date(req.created_at).toLocaleString()} | 
                                                TO: {req.payout_address}
                                            </div>
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.6rem', padding: '4px 10px', fontWeight: 900, 
                                            backgroundColor: req.status === 'approved' ? '#00ccff' : '#ff4444', 
                                            color: '#000', textTransform: 'uppercase' 
                                        }}>
                                            {req.status}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3 }}>NO_HISTORY_AVAILABLE</div>
                                )}
                            </div>
                        </div>

                        {/* PROJECT_PAYMENT_AUDIT_TRAIL */}
                        <div style={{ marginTop: '4rem', borderTop: '2px solid var(--color-border)', paddingTop: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                                Project_Payment_Audit_Trail
                                <button onClick={fetchGlobalPayments} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.7rem' }}>[REFRESH]</button>
                            </h2>
                            {globalPayments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>[NO_PAYMENTS_RECORDED_IN_LEDGER]</div>
                            ) : (
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {globalPayments.slice(0, 10).map(pay => (
                                        <div key={pay.id} style={{ 
                                            padding: '1.25rem', 
                                            border: '1px solid #222', 
                                            backgroundColor: '#0a0a0a',
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center' 
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{pay.project_name}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                                                    RECIPIENT: <span style={{ color: '#fff' }}>{pay.profiles?.full_name || 'ID: ' + pay.user_id.slice(0, 8)}</span> | 
                                                    DATE: {new Date(pay.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ color: 'var(--color-accent)', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>+${pay.amount} USD</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== USERS TAB (PHASE 6) ===== */}
                {activeTab === 'users' && (
                    <div style={sectionBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>USER_CONTROL_HUB</h2>
                            <button 
                                onClick={() => setFreelancerFilter(!freelancerFilter)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: freelancerFilter ? 'var(--color-accent)' : 'transparent',
                                    color: freelancerFilter ? '#000' : 'var(--color-accent)',
                                    border: '1px solid var(--color-accent)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.6rem',
                                    fontWeight: 900,
                                    cursor: 'pointer'
                                }}
                            >
                                {freelancerFilter ? 'VIEW_ALL_USERS' : 'FREELANCERS_ONLY'}
                            </button>
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
                                .filter(u => freelancerFilter ? u.role === 'freelancer' : true)
                                .map(u => (
                                <div key={u.id} style={{ padding: '1.5rem', border: '1px solid var(--color-border)', backgroundColor: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 900, marginBottom: '0.2rem' }}>
                                            {u.full_name || 'NO_NAME'} 
                                            {u.is_pro && <span style={{ color: 'var(--color-accent)', fontSize: '0.6rem', marginLeft: '0.5rem' }}>[PRO]</span>}
                                            {u.role === 'freelancer' && <span style={{ color: '#00ccff', fontSize: '0.6rem', marginLeft: '0.5rem' }}>[FREELANCER]</span>}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{u.email}</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 900, marginTop: '0.5rem', display: 'flex', gap: '1.5rem' }}>
                                            <span>COMPUTE: {u.credits || 0} CR</span>
                                            {u.role === 'freelancer' && <span style={{ color: 'var(--color-accent)' }}>PAY_BAL: ${u.pay_balance || '0.00'}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end', maxWidth: '350px' }}>
                                        <button onClick={() => handleAdjustCredits(u.id, 50, 'ADMIN_GRANT')} style={{ ...buttonStyle, padding: '0.5rem', fontSize: '0.6rem' }}>+50 CR</button>
                                        <button onClick={() => handleAdjustCredits(u.id, -50, 'ADMIN_REVOKE')} style={{ ...buttonStyle, backgroundColor: '#333', color: '#fff', padding: '0.5rem', fontSize: '0.6rem' }}>-50 CR</button>
                                        
                                        <button onClick={() => handleTogglePro(u.id, !u.is_pro)} style={{ ...buttonStyle, backgroundColor: u.is_pro ? '#ff4444' : 'var(--color-accent)', padding: '0.5rem', fontSize: '0.6rem' }}>
                                            {u.is_pro ? 'STRIP_PRO' : 'GRANT_PRO'}
                                        </button>

                                        <button onClick={() => handleToggleRole(u.id, u.role)} style={{ ...buttonStyle, backgroundColor: u.role === 'freelancer' ? '#ff4444' : '#00ccff', color: '#000', padding: '0.5rem', fontSize: '0.6rem' }}>
                                            {u.role === 'freelancer' ? 'REVOKE_FREELANCER' : 'SET_FREELANCER'}
                                        </button>

                                        {u.role === 'freelancer' && (
                                            <>
                                                <button 
                                                    onClick={() => {
                                                        setPayData({ ...payData, userId: u.id });
                                                        setIsPayModalOpen(true);
                                                    }}
                                                    style={{ ...buttonStyle, backgroundColor: '#fff', color: '#000', padding: '0.5rem', fontSize: '0.6rem' }}
                                                >
                                                    RECORD_COMPLETION
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
 
                {/* ===== METRICS TAB (PHASE 6) ===== */}
                {activeTab === 'metrics' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div style={sectionBox}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '1rem' }}>USER_BASE_SYNC</div>
                            <div style={{ fontSize: '3rem', fontWeight: 900 }}>{metrics.users}</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>TOTAL_REGISTERED_OPERATIVES</div>
                        </div>
                        <div style={sectionBox}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '1rem' }}>CREDIT_CIRCULATION</div>
                            <div style={{ fontSize: '3rem', fontWeight: 900 }}>{metrics.totalCredits}</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>TOTAL_ACTIVE_COMPUTE_POWER</div>
                        </div>
                    </div>
                )}
                {/* ===== APPLICANTS TAB ===== */}
                {activeTab === 'applicants' && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Incoming Dossiers</h2>
                            <button onClick={fetchApplicants} style={{ ...buttonStyle, padding: '0.5rem 1rem', fontSize: '0.7rem' }}>REFRESH</button>
                        </div>
                        {applicants.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--color-border)', opacity: 0.5 }}>[NO_APPLICATIONS_IN_ARCHIVE]</div>
                        ) : (
                            applicants.map(app => (
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

                                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #222', paddingTop: '1.5rem' }}>
                                        <select 
                                            value={app.status} 
                                            onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value, app.user_id)}
                                            style={{ ...inputStyle, width: 'auto', flex: 1, padding: '0.5rem' }}
                                        >
                                            <option value="NEW">MARK_NEW</option>
                                            <option value="REVIEWING">REVIEWING</option>
                                            <option value="ACCEPTED">ACCEPTED</option>
                                            <option value="REJECTED">REJECTED</option>
                                        </select>
                                        <button onClick={() => handleDeleteApplicant(app.id)} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#333', color: '#ff4444', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>WIPE_RECORD</button>
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

