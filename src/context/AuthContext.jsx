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
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        };

        getSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setProfile(null);
            setLoading(false);
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

    const spendCredits = async (amount) => {
        if (!profile || profile.credits < amount) return false;

        const newCredits = profile.credits - amount;
        
        // Optimistic Update
        setProfile(prev => ({ ...prev, credits: newCredits }));

        const { error } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', user.id);

        if (error) {
            console.error('Error spending credits:', error);
            // Rollback on error
            fetchProfile(user.id);
            return false;
        }
        return true;
    };

    const value = {
        user,
        profile,
        loading,
        spendCredits,
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
