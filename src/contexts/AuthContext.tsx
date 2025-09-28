import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userProfile: any;
  refreshProfile: () => Promise<void>;
  devBypass: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Check for dev mode first
    const devSession = localStorage.getItem('dev-admin-session');
    if (devSession) {
      const mockUser = {
        id: 'dev-admin-id',
        email: 'admin@dev.local',
        user_metadata: { first_name: 'Dev', last_name: 'Admin', role: 'admin' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated'
      } as User;
      
      const mockSession = {
        access_token: 'dev-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        refresh_token: 'dev-refresh',
        user: mockUser
      } as Session;
      
      setUser(mockUser);
      setSession(mockSession);
      setUserProfile({
        id: 'dev-profile-id',
        user_id: 'dev-admin-id',
        first_name: 'Dev',
        last_name: 'Admin',
        role: 'admin'
      });
      setLoading(false);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch user profile when user signs in
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      }
    });
    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem('dev-admin-session');
    await supabase.auth.signOut();
  };

  const devBypass = async (password: string) => {
    if (password !== 'Braka') {
      throw new Error('Invalid password');
    }
    
    localStorage.setItem('dev-admin-session', 'true');
    
    const mockUser = {
      id: 'dev-admin-id',
      email: 'admin@dev.local',
      user_metadata: { first_name: 'Dev', last_name: 'Admin', role: 'admin' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'authenticated'
    } as User;
    
    const mockSession = {
      access_token: 'dev-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      refresh_token: 'dev-refresh',
      user: mockUser
    } as Session;
    
    setUser(mockUser);
    setSession(mockSession);
    setUserProfile({
      id: 'dev-profile-id',
      user_id: 'dev-admin-id',
      first_name: 'Dev',
      last_name: 'Admin',
      role: 'admin'
    });
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    userProfile,
    refreshProfile,
    devBypass,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};