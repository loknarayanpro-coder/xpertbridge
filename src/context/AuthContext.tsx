import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role } from '../types';
import { DEMO_USERS } from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (details: {
    email: string;
    password?: string;
    display_name: string;
    college: string;
    department_code?: string;
    academic_year?: number;
    semester?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: Role) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_STORAGE_KEY = 'xpertbridge_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  }, [user]);

  // Synchronize with live Supabase authentication state
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check active session on initial page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setUser(profile as UserProfile);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setUser(profile as UserProfile);
        }
      }
      // Note: Do not clear user on spurious SIGNED_OUT events if localStorage holds an authenticated session
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        setLoading(false);
        return { success: false, error: 'Email address is required' };
      }

      if (!password) {
        setLoading(false);
        return { success: false, error: 'Password is required' };
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }

        if (data?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const isAdminUser = profile?.role === 'admin' || cleanEmail === 'loknarayanpro@gmail.com';
          const authenticatedUser: UserProfile = profile || {
            id: data.user.id,
            email: cleanEmail,
            display_name: cleanEmail.split('@')[0],
            role: isAdminUser ? 'admin' : 'student',
            college: 'College Campus',
            department_code: 'CSE',
            created_at: new Date().toISOString(),
          };

          setUser(authenticatedUser);
          setLoading(false);
          return { success: true };
        }
      }

      setLoading(false);
      return { success: false, error: 'Unable to connect to authentication service.' };
    } catch (err: unknown) {
      setLoading(false);
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  const signup = async (details: {
    email: string;
    password?: string;
    display_name: string;
    college: string;
    department_code?: string;
    academic_year?: number;
    semester?: number;
  }): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && details.password) {
        const { data, error } = await supabase.auth.signUp({
          email: details.email.trim().toLowerCase(),
          password: details.password,
          options: {
            data: {
              display_name: details.display_name.trim(),
              college: details.college.trim(),
              department_code: details.department_code || 'CSE',
              semester: details.semester || 1,
            }
          }
        });

        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newProfile: UserProfile = {
            id: data.user.id,
            email: details.email.trim().toLowerCase(),
            display_name: details.display_name.trim(),
            role: 'student',
            college: details.college.trim() || 'College Campus',
            department_code: details.department_code || 'CSE',
            academic_year: details.academic_year || 1,
            semester: details.semester || 1,
            created_at: new Date().toISOString(),
          };
          await supabase.from('profiles').upsert([newProfile]);
          setUser(newProfile);
          setLoading(false);
          return { success: true };
        }
      }

      setLoading(false);
      return { success: false, error: 'Registration service unavailable. Please try again.' };
    } catch (err: unknown) {
      setLoading(false);
      return { success: false, error: err instanceof Error ? err.message : 'Registration failed' };
    }
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const switchDemoRole = (_role: Role): void => {
    // Disabled in production
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);

    if (isSupabaseConfigured) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        signup,
        logout,
        switchDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
