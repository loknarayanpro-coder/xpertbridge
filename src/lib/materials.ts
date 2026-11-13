import { supabase, isSupabaseConfigured } from './supabase';
import { Resource, ResourceFilters } from '../types';

// Helper to identify real user uploaded files
function isUserUploaded(r: Resource): boolean {
  if (!r) return false;
  if (r.uploader_name === 'loknarayanpro' || r.uploaded_by === 'a2f68cc4-a819-4a1a-8f57-c429f0ce5b87') {
    return true;
  }
  if (r.storage_path && /\b\d{13}_/.test(r.storage_path)) {
    return true;
  }
  return false;
}

export const materialsService = {
  // Fetch materials with optional filtering
  async getMaterials(filters?: Partial<ResourceFilters>): Promise<Resource[]> {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('resources')
      .select('*')
      .eq('publication_status', 'published')
      .order('created_at', { ascending: false });

    if (filters?.departmentId && filters.departmentId !== 'all') {
      query = query.eq('department_id', filters.departmentId);
    }
    if (filters?.semester && filters.semester !== 'all') {
      const semNum = parseInt(filters.semester, 10);
      if (!isNaN(semNum)) query = query.eq('semester', semNum);
    }
    if (filters?.subjectId && filters.subjectId !== 'all') {
      query = query.eq('subject_id', filters.subjectId);
    }
    if (filters?.resourceType && filters.resourceType !== 'all') {
      query = query.eq('resource_type', filters.resourceType);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching materials:', error);
      return [];
    }

    return ((data || []) as Resource[]).filter(isUserUploaded);
  },

  // Get material by ID
  async getMaterialById(id: string): Promise<Resource | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching material by ID:', error);
      return null;
    }
    return data as Resource;
  },

  // Upload PDF file to Supabase Storage bucket 'academic-resources'
  async uploadFile(file: File, folder: string = 'notes'): Promise<{ path: string; publicUrl: string } | null> {
    if (!isSupabaseConfigured) return null;

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${folder}/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('academic-resources')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/pdf',
      });

    if (error) {
      console.error('Error uploading PDF file to Supabase Storage:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('academic-resources')
      .getPublicUrl(data.path);

    return { path: data.path, publicUrl };
  },

  // Get public download/view URL for an educational material
  getPublicUrl(storagePath: string): string {
    if (!storagePath) return '';
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
      return storagePath;
    }
    const cleanPath = storagePath.replace(/^uploads\//, 'notes/');
    const { data: { publicUrl } } = supabase.storage
      .from('academic-resources')
      .getPublicUrl(cleanPath);
    return publicUrl || '';
  },

  // Download real binary PDF blob directly from Supabase Storage
  async downloadFile(storagePath: string): Promise<Blob | null> {
    if (!storagePath) return null;
    let cleanPath = storagePath;
    if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.replace(/^uploads\//, 'notes/');
    }

    try {
      const { data, error } = await supabase.storage
        .from('academic-resources')
        .download(cleanPath);

      if (!error && data) {
        return data;
      }
      if (error) {
        console.warn('Supabase storage download warning:', error);
      }
    } catch (e) {
      console.warn('Storage download threw error:', e);
    }

    // Secondary fallback: fetch directly via HTTP from public URL
    try {
      const publicUrl = this.getPublicUrl(cleanPath);
      if (publicUrl) {
        const res = await fetch(publicUrl);
        if (res.ok) {
          const blob = await res.blob();
          if (blob && blob.size > 0) return blob;
        }
      }
    } catch (fetchErr) {
      console.warn('Direct fetch fallback warning:', fetchErr);
    }

    return null;
  },

  // Increment download counter
  async incrementDownloadCount(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      const { data } = await supabase
        .from('resources')
        .select('download_count')
        .eq('id', id)
        .single();

      const currentCount = data?.download_count || 0;
      await supabase
        .from('resources')
        .update({ download_count: currentCount + 1 })
        .eq('id', id);
    } catch (e) {
      console.warn('Error incrementing download count:', e);
    }
  },

  // Centralized robust resource downloader
  async downloadResource(resource: Resource): Promise<void> {
    if (!resource) return;

    // 1. Increment counter
    await this.incrementDownloadCount(resource.id);

    // 2. Check if a real physical document was uploaded to Supabase Storage
    const hasStorageFile = Boolean(
      isSupabaseConfigured &&
      resource.storage_path &&
      resource.storage_path.trim() !== '' &&
      !resource.storage_path.startsWith('demo/')
    );

    if (hasStorageFile) {
      try {
        const blob = await this.downloadFile(resource.storage_path);
        if (blob && blob.size > 0) {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          let filename = resource.original_filename || `${resource.title}.pdf`;
          if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
          }
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
          return;
        }
      } catch (err) {
        console.error('Error downloading binary PDF from Supabase storage:', err);
      }

      // Fallback: try public URL in new window
      const publicUrl = this.getPublicUrl(resource.storage_path);
      if (publicUrl) {
        window.open(publicUrl, '_blank');
        return;
      }
    }

    // 3. Fallback for text-only syllabus previews: Strictly save as .txt, NEVER .pdf
    const textContent = `XPERTBRIDGE ACADEMIC ARCHIVE\n=====================================\nTitle: ${resource.title}\nSubject: ${resource.subject_name || resource.subject_code} (${resource.subject_code})\nDepartment: ${resource.department_code}\nSemester: ${resource.semester}\nUnits: ${resource.units_label || 'All Units'}\nContributor: ${resource.uploader_name}\nDownloaded from: XpertBridge Platform\n\n${resource.description}\n\nCONTENT OUTLINE:\n${(resource.sample_content || []).join('\n')}\n\n[Note: This syllabus outline was generated for preview. The full verified textbook PDF has not yet been uploaded for this record.]\n`;
    const textBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const textUrl = URL.createObjectURL(textBlob);
    const link = document.createElement('a');
    link.href = textUrl;
    const safeTitle = (resource.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeTitle}_Preview.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(textUrl), 2000);
  },
};
