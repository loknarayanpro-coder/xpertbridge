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
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          // fetch profile
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          const userProfile: UserProfile = profile || {
            id: data.user.id,
            email: data.user.email || email,
            display_name: email.split('@')[0],
            role: 'student',
            college: 'College Campus',
            created_at: new Date().toISOString(),
          };
          setUser(userProfile);
          setLoading(false);
          return { success: true };
        }
      }

      // Local / Demo mode handling
      if (email.toLowerCase().includes('admin')) {
        setUser(DEMO_USERS.admin);
        setLoading(false);
        return { success: true };
      } else {
        const matchedStudent: UserProfile = {
          ...DEMO_USERS.student,
          email,
          display_name: email.split('@')[0].replace('.', ' '),
        };
        setUser(matchedStudent);
        setLoading(false);
        return { success: true };
      }
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
          email: details.email,
          password: details.password,
          options: {
            data: {
              display_name: details.display_name,
              college: details.college,
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
            email: details.email,
            display_name: details.display_name,
            role: 'student',
            college: details.college,
            department_code: details.department_code,
            academic_year: details.academic_year,
            semester: details.semester,
            created_at: new Date().toISOString(),
          };
          await supabase.from('profiles').insert([newProfile]);
          setUser(newProfile);
          setLoading(false);
          return { success: true };
        }
      }

      // Demo signup
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: details.email,
        display_name: details.display_name,
        role: 'student',
        college: details.college || 'Suryodaya Institute of Engineering & Technology',
        department_code: details.department_code || 'CSE',
        academic_year: details.academic_year || 1,
        semester: details.semester || 1,
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      setLoading(false);
      return { success: true };
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

  const switchDemoRole = (role: Role): void => {
    if (role === 'admin') {
      setUser(DEMO_USERS.admin);
    } else {
      setUser(DEMO_USERS.student);
    }
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
