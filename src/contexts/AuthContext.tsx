import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserAccess {
  premium_active: boolean;
  expires_at: string | null;
}

interface Profile {
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userAccess: UserAccess | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isPremium: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(false); // Iniciar como false para não bloquear render

  const fetchUserData = async (userId: string) => {
    try {
      const [profileResult, accessResult] = await Promise.all([
        supabase.from('profiles').select('email, full_name, is_admin').eq('user_id', userId).maybeSingle(),
        supabase.from('user_access').select('premium_active, expires_at').eq('user_id', userId).maybeSingle()
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }
      if (accessResult.data) {
        setUserAccess(accessResult.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user data em background, não bloqueia render
        fetchUserData(session.user.id).catch(error => {
          console.error('Error fetching user data in onAuthStateChange:', error);
        });
      } else {
        setProfile(null);
        setUserAccess(null);
      }
    });

    // Verificar sessão atual - sem bloquear render
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user data em background, não bloqueia render
          fetchUserData(session.user.id).catch(error => {
            console.error('Error fetching user data:', error);
          });
        }
      })
      .catch((error: Error) => {
        if (!isMounted) return;
        console.error('Error in getSession:', error);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const trimmedEmail = email.trim().toLowerCase();
    
    console.log('Attempting to sign up with email:', trimmedEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
    } else {
      console.log('Sign up successful:', data);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserAccess(null);
  };

  const isPremium = userAccess?.premium_active ?? false;
  const isAdmin = profile?.is_admin ?? false;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      userAccess,
      loading,
      signUp,
      signIn,
      signOut,
      isPremium,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
