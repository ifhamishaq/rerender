import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        console.log('AUTH_TRACE: Auth Engine Started');
        
        let mounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            
            console.log(`AUTH_TRACE: Event [${event}] | Session Object [${!!session}]`);
            
            try {
                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                    const currentUser = session?.user ?? null;
                    setUser(currentUser);
                    if (currentUser) {
                        // FIRE AND FORGET: Don't block loading on the profile fetch
                        fetchProfile(currentUser.id);
                    } else {
                        setProfile(null);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                }
            } catch (err) {
                console.error('AUTH_TRACE: Protocol Sync Error:', err);
            } finally {
                // Ensure loading is false as soon as we have the USER object
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId) => {
        console.log('AUTH_TRACE: Fetching dossier for UID:', userId);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (data) {
                console.log('AUTH_TRACE: Dossier resolved for', data.full_name);
                setProfile(data);
            } else if (error && error.code === 'PGRST116') {
                console.log('AUTH_TRACE: Dossier missing, initiating creation...');
                const { data: newData, error: createError } = await supabase
                    .from('profiles')
                    .insert([{ id: userId, credits: 50, role: 'user' }])
                    .select()
                    .single();
                
                if (newData) setProfile(newData);
                if (createError) console.error('AUTH_TRACE: Creation failed:', createError);
            } else if (error) {
                console.error('AUTH_TRACE: Query Error:', error.message);
            }
        } catch (err) {
            console.error('AUTH_TRACE: Network/Protocol Error:', err);
        }
    };

    const spendCredits = async (amount, reason = 'SYSTEM_USAGE') => {
        if (!profile || profile.credits < amount) return false;

        const newCredits = profile.credits - amount;
        
        // Optimistic Update
        setProfile(prev => ({ ...prev, credits: newCredits }));

        // 1. Update Credits
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error spending credits:', profileError);
            fetchProfile(user.id);
            return false;
        }

        // 2. Log Transaction
        await supabase
            .from('credit_logs')
            .insert({
                user_id: user.id,
                amount: -amount,
                type: 'spend',
                reason: reason
            });

        return true;
    };

    const rewardCredits = async (amount, reason = 'REWARD') => {
        if (!profile) return false;

        const newCredits = profile.credits + amount;
        setProfile(prev => ({ ...prev, credits: newCredits }));

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error rewarding credits:', profileError);
            fetchProfile(user.id);
            return false;
        }

        await supabase
            .from('credit_logs')
            .insert({
                user_id: user.id,
                amount: amount,
                type: 'reward',
                reason: reason
            });

        return true;
    };

    const value = {
        user,
        profile,
        loading,
        spendCredits,
        rewardCredits,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signInWithGoogle: () => supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        }),
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        signUp: (email, password, fullName) => supabase.auth.signUp({ 
            email, 
            password,
            options: { data: { full_name: fullName } }
        }),
        signOut: () => supabase.auth.signOut(),
        refreshProfile: () => user && fetchProfile(user.id)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
