import { supabase, isSupabaseConfigured } from './supabase';
import { Resource, Submission } from '../types';

export const adminService = {
  // Check if current authenticated user has admin role
  async checkIsAdmin(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  },

  // Get all resources (including drafts/pending) for admin management
  async getAllResources(): Promise<Resource[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin resources:', error);
      return [];
    }

    return (data || []) as Resource[];
  },

  // Admin upload / create educational resource directly
  async createResource(resource: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'download_count'>): Promise<Resource | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('resources')
      .insert([{
        ...resource,
        download_count: 0,
        publication_status: 'published',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating resource:', error);
      throw error;
    }

    return data as Resource;
  },

  // Admin update resource
  async updateResource(id: string, updates: Partial<Resource>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating resource:', error);
      return false;
    }

    return true;
  },

  // Admin delete resource
  async deleteResource(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting resource:', error);
      return false;
    }

    return true;
  },

  // Get all submissions for review
  async getAllSubmissions(): Promise<Submission[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('submissions')
      .select('*, resource:resources(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions for admin:', error);
      return [];
    }

    return (data || []) as Submission[];
  },

  // Review submission (approve or reject)
  async reviewSubmission(
    submissionId: string, 
    resourceId: string, 
    status: 'published' | 'rejected', 
    notes?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Update submission status
    await supabase
      .from('submissions')
      .update({
        moderation_status: status,
        reviewer_id: user?.id,
        reviewer_notes: notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    // 2. Update resource publication status
    const { error } = await supabase
      .from('resources')
      .update({ publication_status: status })
      .eq('id', resourceId);

    return !error;
  },
};

