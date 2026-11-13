import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndzzukyvgjzwbrapgjkj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kenp1a3l2Z2p6d2JyYXBnamtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NzM3ODcsImV4cCI6MjExMDE0OTc4N30.v4PK6rQgw4CHOR-9D-PsarFzdBk1Lr1GraLlVV4aWWo';

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
