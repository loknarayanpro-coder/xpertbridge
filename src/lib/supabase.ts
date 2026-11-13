import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndzzukyvgjzwbrapgjkj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kenp1a3l2Z2p6d2JyYXBnamtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjgwODksImV4cCI6MjA3NzA0NDA4OX0.d1VvW8N4Z2r2q3XpT7eJ0A1b_8gZ9cK4LmN2pQ5rS6t';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-supabase-url')
);

// Fallback dummy client if credentials aren't supplied so runtime doesn't throw
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder-project.supabase.co', 'placeholder-anon-key');
