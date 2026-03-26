import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export const useDossier = () => {
    const { user, refreshProfile } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 1. Fetch Requests
    const fetchRequests = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('topup_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (!error && data) setRequests(data);
        setLoading(false);
    }, [user]);

    // 2. Real-time Subscription
    useEffect(() => {
        if (!user) return;

        fetchRequests();

        // Subscribe to topup_requests changes
        const requestChannel = supabase
            .channel('dossier_requests')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'topup_requests', filter: `user_id=eq.${user.id}` }, 
                () => {
                    fetchRequests();
                    refreshProfile(); // Also refresh profile because a request being approved might update credits
                }
            )
            .subscribe();

        // Subscribe to profile changes (for credit updates)
        const profileChannel = supabase
            .channel('dossier_profile')
            .on('postgres_changes', 
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, 
                () => refreshProfile()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(requestChannel);
            supabase.removeChannel(profileChannel);
        };
    }, [user, fetchRequests, refreshProfile]);

    // 3. Submit Request Action
    const submitRequest = async (amount, txId) => {
        if (!txId) throw new Error('Transaction ID is required');
        setSubmitting(true);
        try {
            const { error } = await supabase.from('topup_requests').insert([
                { user_id: user.id, amount: parseInt(amount), transaction_id: txId }
            ]);
            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Submit failed:', err);
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        requests,
        loading,
        submitting,
        submitRequest,
        refresh: fetchRequests
    };
};
