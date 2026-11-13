import { supabase, isSupabaseConfigured } from './supabase';
import { Resource, Bookmark, Submission } from '../types';

export const studentService = {
  // Get all bookmarks for a student
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    if (!isSupabaseConfigured || !userId) return [];

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, resource:resources(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student bookmarks:', error);
      return [];
    }

    return (data || []) as Bookmark[];
  },

  // Toggle bookmark (add or remove)
  async toggleBookmark(userId: string, resource: Resource): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    // Check if already bookmarked
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .match({ user_id: userId, resource_id: resource.id })
      .maybeSingle();

    if (existing) {
      await supabase
        .from('bookmarks')
        .delete()
        .match({ user_id: userId, resource_id: resource.id });
      return false; // Removed
    } else {
      await supabase
        .from('bookmarks')
        .insert([{ user_id: userId, resource_id: resource.id }]);
      return true; // Added
    }
  },

  // Get student's own submissions
  async getMySubmissions(userId: string): Promise<Submission[]> {
    if (!isSupabaseConfigured || !userId) return [];

    const { data, error } = await supabase
      .from('submissions')
      .select('*, resource:resources(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student submissions:', error);
      return [];
    }

    return (data || []) as Submission[];
  },

  // Submit note or question paper for review
  async submitContribution(userId: string, userName: string, userEmail: string, resourceId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('submissions')
      .insert([{
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        resource_id: resourceId,
        moderation_status: 'pending',
      }]);

    return !error;
  },
};

