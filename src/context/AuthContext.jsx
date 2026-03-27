import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        // Check active sessions
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (err) {
                console.error('Session Init Error:', err);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                setLoading(true);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error('Auth Change Error:', err);
            } finally {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (data) setProfile(data);
        if (error) console.error('Error fetching profile:', error);
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
