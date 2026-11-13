import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, Role } from '../types';

export const authService = {
  // Get active session
  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Get current user profile
  async getCurrentProfile(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile as UserProfile || null;
  },

  // Student registration
  async signUp(details: {
    email: string;
    password?: string;
    display_name: string;
    college: string;
    department_code?: string;
    academic_year?: number;
    semester?: number;
  }) {
    if (!isSupabaseConfigured) {
      return { success: true, user: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email: details.email,
      password: details.password || 'password123',
      options: {
        data: {
          display_name: details.display_name,
          college: details.college,
          department_code: details.department_code || 'CSE',
          academic_year: details.academic_year || 1,
          semester: details.semester || 1,
          role: 'student',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Ensure profile row exists
      const newProfile: Partial<UserProfile> = {
        id: data.user.id,
        email: details.email,
        display_name: details.display_name,
        role: 'student' as Role,
        college: details.college,
        department_code: details.department_code || 'CSE',
        academic_year: details.academic_year || 1,
        semester: details.semester || 1,
      };

      await supabase.from('profiles').upsert([newProfile]);
    }

    return { success: true, user: data.user };
  },

  // Sign in (student or admin)
  async signIn(email: string, password?: string) {
    if (!isSupabaseConfigured) {
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'password123',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Retrieve profile to identify role (student vs admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return { 
      success: true, 
      user: data.user, 
      profile: profile as UserProfile | null 
    };
  },

  // Sign out
  async signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },
};

