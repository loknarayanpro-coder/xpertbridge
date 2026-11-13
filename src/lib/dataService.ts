import { Department, Subject, Resource, ResourceFilters, Bookmark, Submission, PublicationStatus, ResourceRequest } from '../types';
import { INITIAL_DEPARTMENTS, INITIAL_SUBJECTS, INITIAL_RESOURCES, INITIAL_SUBMISSIONS, INITIAL_RESOURCE_REQUESTS } from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  DEPARTMENTS: 'xpertbridge_departments',
  SUBJECTS: 'xpertbridge_subjects',
  RESOURCES: 'xpertbridge_resources',
  BOOKMARKS: 'xpertbridge_bookmarks',
  SUBMISSIONS: 'xpertbridge_submissions',
  REQUESTS: 'xpertbridge_requests',
  WAITLISTS: 'xpertbridge_waitlists',
};

// Helper to initialize local storage
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Failed to parse ${key} from localStorage:`, e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
}

// Clean out any legacy mock cache so only genuine uploaded files are kept
try {
  localStorage.removeItem(STORAGE_KEYS.RESOURCES);
  localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
  localStorage.removeItem(STORAGE_KEYS.REQUESTS);
} catch {
  // ignore
}

// Function to strictly identify genuine user-uploaded files
function isUserUploaded(r: Resource): boolean {
  if (!r) return false;
  if (r.uploader_name === 'loknarayanpro' || r.uploaded_by === 'a2f68cc4-a819-4a1a-8f57-c429f0ce5b87') {
    return true;
  }
  // Any real storage upload with a valid timestamped path
  if (r.storage_path && !r.storage_path.startsWith('demo/') && !r.storage_path.startsWith('qp/cse/cs3351') && r.storage_path.includes('_')) {
    return true;
  }
  return false;
}

export const dataService = {
  // Check backend status
  isLiveSupabase(): boolean {
    return isSupabaseConfigured;
  },

  // DEPARTMENTS
  async getDepartments(): Promise<Department[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('departments').select('*').order('name');
      if (!error && data) return data as Department[];
    }
    return getLocalItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  async getDepartmentById(id: string): Promise<Department | undefined> {
    const departments = await this.getDepartments();
    return departments.find(d => d.id === id || d.code.toLowerCase() === id.toLowerCase());
  },

  async createDepartment(dept: Omit<Department, 'id' | 'created_at' | 'total_subjects' | 'total_resources'>): Promise<Department> {
    const newDept: Department = {
      ...dept,
      id: `dept-${dept.code.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      total_subjects: 0,
      total_resources: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      await supabase.from('departments').insert([newDept]);
    }

    const current = await this.getDepartments();
    const updated = [...current, newDept];
    setLocalItem(STORAGE_KEYS.DEPARTMENTS, updated);
    return newDept;
  },

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const current = await this.getDepartments();
    const index = current.findIndex(d => d.id === id);
    if (index === -1) return undefined;

    const updatedDept = { ...current[index], ...updates };
    current[index] = updatedDept;

    if (isSupabaseConfigured) {
      await supabase.from('departments').update(updates).eq('id', id);
    }

    setLocalItem(STORAGE_KEYS.DEPARTMENTS, current);
    return updatedDept;
  },

  async deleteDepartment(id: string): Promise<boolean> {
    const current = await this.getDepartments();
    const filtered = current.filter(d => d.id !== id);

    if (isSupabaseConfigured) {
      await supabase.from('departments').delete().eq('id', id);
    }

    setLocalItem(STORAGE_KEYS.DEPARTMENTS, filtered);
    return true;
  },

  // SUBJECTS
  async getSubjects(departmentId?: string, semester?: number): Promise<Subject[]> {
    let subjects: Subject[] = [];

    if (isSupabaseConfigured) {
      let query = supabase.from('subjects').select('*');
      if (departmentId) query = query.eq('department_id', departmentId);
      if (semester) query = query.eq('semester', semester);
      const { data, error } = await query.order('name');
      if (!error && data) subjects = data as Subject[];
    } else {
      subjects = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    }

    return subjects.filter(s => {
      if (departmentId && s.department_id !== departmentId && s.department_code.toLowerCase() !== departmentId.toLowerCase()) {
        return false;
      }
      if (semester && s.semester !== semester) {
        return false;
      }
      return true;
    });
  },

  async getSubjectById(id: string): Promise<Subject | undefined> {
    const subjects = await this.getSubjects();
    return subjects.find(s => s.id === id || s.subject_code.toLowerCase() === id.toLowerCase());
  },

  async createSubject(subject: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> {
    const newSubject: Subject = {
      ...subject,
      id: `sub-${subject.subject_code.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      await supabase.from('subjects').insert([newSubject]);
    }

    const current = await this.getSubjects();
    const updated = [...current, newSubject];
    setLocalItem(STORAGE_KEYS.SUBJECTS, updated);
    return newSubject;
  },

  // RESOURCES
  async getResources(filters?: Partial<ResourceFilters>): Promise<Resource[]> {
    let resources: Resource[] = [];

    if (isSupabaseConfigured) {
      let query = supabase.from('resources').select('*').eq('publication_status', 'published');

      if (filters?.departmentId && filters.departmentId !== 'all') {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.departmentId);
        if (isUUID) {
          query = query.eq('department_id', filters.departmentId);
        } else {
          const cleanCode = filters.departmentId.replace(/^dept-/i, '').toUpperCase();
          query = query.ilike('department_code', cleanCode);
        }
      }

      if (filters?.resourceType && filters.resourceType !== 'all') {
        query = query.eq('resource_type', filters.resourceType);
      }

      if (filters?.semester && filters.semester !== 'all') {
        const sem = parseInt(filters.semester, 10);
        if (!isNaN(sem)) query = query.eq('semester', sem);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getResources query error:', error);
      } else if (data) {
        resources = (data as Resource[]).filter(isUserUploaded);
      }
    } else {
      resources = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES).filter(isUserUploaded);
    }

    // Filter in-memory for rich interactions
    let filtered = resources.filter(r => r.publication_status === 'published');

    if (filters?.departmentId && filters.departmentId !== 'all') {
      const cleanCode = filters.departmentId.replace(/^dept-/i, '').toLowerCase();
      filtered = filtered.filter(r => 
        r.department_id === filters.departmentId || 
        r.department_code?.toLowerCase() === cleanCode ||
        r.department_code?.toLowerCase() === filters.departmentId?.toLowerCase()
      );
    }

    if (filters?.semester && filters.semester !== 'all') {
      const semNum = parseInt(filters.semester, 10);
      filtered = filtered.filter(r => r.semester === semNum);
    }

    if (filters?.academicYear && filters.academicYear !== 'all') {
      const yearNum = parseInt(filters.academicYear, 10);
      filtered = filtered.filter(r => r.academic_year === yearNum);
    }

    if (filters?.subjectId && filters.subjectId !== 'all') {
      filtered = filtered.filter(r => 
        r.subject_id === filters.subjectId || 
        r.subject_code?.toLowerCase() === filters.subjectId?.toLowerCase()
      );
    }

    if (filters?.unit && filters.unit !== 'all') {
      const unitNum = parseInt(filters.unit, 10);
      filtered = filtered.filter(r => r.unit_number === unitNum || r.units_label?.includes(`Unit ${unitNum}`));
    }

    if (filters?.resourceType && filters.resourceType !== 'all') {
      filtered = filtered.filter(r => r.resource_type === filters.resourceType);
    }

    if (filters?.regulation && filters.regulation !== 'all') {
      filtered = filtered.filter(r => r.question_paper?.regulation === filters.regulation);
    }

    if (filters?.examYear && filters.examYear !== 'all') {
      const yr = parseInt(filters.examYear, 10);
      filtered = filtered.filter(r => r.question_paper?.examination_year === yr);
    }

    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.subject_name?.toLowerCase().includes(query) ||
        r.subject_code?.toLowerCase().includes(query) ||
        r.department_code?.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (filters?.sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters?.sortBy === 'popular') {
      filtered.sort((a, b) => b.download_count - a.download_count);
    } else {
      // Default newest
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  },

  async getAllResourcesAdmin(): Promise<Resource[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
      if (!error && data) return (data as Resource[]).filter(isUserUploaded);
    }
    return getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES).filter(isUserUploaded);
  },

  async getResourceById(id: string): Promise<Resource | undefined> {
    const resources = await this.getAllResourcesAdmin();
    return resources.find(r => r.id === id);
  },

  async getPopularNotes(limit: number = 5): Promise<Resource[]> {
    const resources = await this.getResources({ resourceType: 'notes' });
    return resources
      .sort((a, b) => b.download_count - a.download_count)
      .slice(0, limit);
  },

  async getRecentlyAdded(limit: number = 4): Promise<Resource[]> {
    const resources = await this.getResources();
    return resources
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  async incrementDownloadCount(id: string): Promise<number> {
    const all = await this.getAllResourcesAdmin();
    const item = all.find(r => r.id === id);
    if (!item) return 0;

    item.download_count += 1;
    if (isSupabaseConfigured) {
      await supabase.from('resources').update({ download_count: item.download_count }).eq('id', id);
    }
    setLocalItem(STORAGE_KEYS.RESOURCES, all);
    return item.download_count;
  },

  async createResource(resource: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'download_count'>): Promise<Resource> {
    const generatedId = crypto.randomUUID();
    const newResource: Resource = {
      ...resource,
      id: generatedId,
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      // Validate UUIDs for foreign keys
      const isValidUUID = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

      // Resolve department UUID
      let finalDeptId = resource.department_id;
      if (!isValidUUID(finalDeptId)) {
        const { data: dept } = await supabase.from('departments').select('id').ilike('code', resource.department_code || 'CSE').maybeSingle();
        if (dept) finalDeptId = dept.id;
      }

      // Resolve subject UUID
      let finalSubId = resource.subject_id;
      if (!isValidUUID(finalSubId)) {
        const { data: sub } = await supabase.from('subjects').select('id').ilike('subject_code', resource.subject_code || '').maybeSingle();
        if (sub) finalSubId = sub.id;
      }

      const isValidUserUUID = isValidUUID(resource.uploaded_by);

      const dbPayload = {
        id: generatedId,
        title: resource.title,
        description: resource.description,
        subject_id: finalSubId,
        subject_name: resource.subject_name,
        subject_code: resource.subject_code,
        department_id: finalDeptId,
        department_code: resource.department_code,
        semester: resource.semester,
        academic_year: resource.academic_year,
        resource_type: resource.resource_type,
        unit_number: resource.unit_number || null,
        units_label: resource.units_label || null,
        storage_path: resource.storage_path || '',
        original_filename: resource.original_filename || `${resource.title}.pdf`,
        file_size: resource.file_size || 0,
        mime_type: resource.mime_type || 'application/pdf',
        uploader_name: resource.uploader_name || 'Academic Admin',
        uploader_avatar: resource.uploader_avatar || null,
        uploaded_by: isValidUserUUID ? resource.uploaded_by : null,
        publication_status: resource.publication_status || 'published',
        download_count: 0,
      };

      const { data, error } = await supabase.from('resources').insert([dbPayload]).select().maybeSingle();
      if (error) {
        console.error('Supabase createResource error:', error);
      } else if (data) {
        newResource.id = data.id;
      }
    }

    const current = await this.getAllResourcesAdmin();
    const updated = [newResource, ...current];
    setLocalItem(STORAGE_KEYS.RESOURCES, updated);
    return newResource;
  },

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource | undefined> {
    const current = await this.getAllResourcesAdmin();
    const index = current.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    const updatedResource = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    current[index] = updatedResource;

    if (isSupabaseConfigured) {
      await supabase.from('resources').update(updates).eq('id', id);
    }

    setLocalItem(STORAGE_KEYS.RESOURCES, current);
    return updatedResource;
  },

  async deleteResource(id: string): Promise<boolean> {
    const current = await this.getAllResourcesAdmin();
    const filtered = current.filter(r => r.id !== id);

    if (isSupabaseConfigured) {
      await supabase.from('resources').delete().eq('id', id);
    }

    setLocalItem(STORAGE_KEYS.RESOURCES, filtered);
    return true;
  },

  // BOOKMARKS
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('bookmarks').select('*, resource:resources(*)').eq('user_id', userId);
      if (!error && data) return data as Bookmark[];
    }

    const bookmarks = getLocalItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    const userBookmarks = bookmarks.filter(b => b.user_id === userId);
    
    // Attach resource details
    const allResources = await this.getAllResourcesAdmin();
    return userBookmarks.map(b => ({
      ...b,
      resource: allResources.find(r => r.id === b.resource_id),
    }));
  },

  async toggleBookmark(userId: string, resourceId: string): Promise<{ bookmarked: boolean }> {
    const bookmarks = getLocalItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    const existingIndex = bookmarks.findIndex(b => b.user_id === userId && b.resource_id === resourceId);

    if (existingIndex >= 0) {
      // Remove
      bookmarks.splice(existingIndex, 1);
      if (isSupabaseConfigured) {
        await supabase.from('bookmarks').delete().match({ user_id: userId, resource_id: resourceId });
      }
      setLocalItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
      return { bookmarked: false };
    } else {
      // Add
      const newBookmark: Bookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        resource_id: resourceId,
        created_at: new Date().toISOString(),
      };
      bookmarks.push(newBookmark);
      if (isSupabaseConfigured) {
        await supabase.from('bookmarks').insert([newBookmark]);
      }
      setLocalItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
      return { bookmarked: true };
    }
  },

  async isBookmarked(userId: string, resourceId: string): Promise<boolean> {
    const bookmarks = getLocalItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    return bookmarks.some(b => b.user_id === userId && b.resource_id === resourceId);
  },

  // SUBMISSIONS
  async getSubmissions(): Promise<Submission[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Submission[];
    }
    return getLocalItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  },

  async createSubmission(submissionData: Omit<Submission, 'id' | 'created_at' | 'moderation_status'>): Promise<Submission> {
    const newSubmission: Submission = {
      ...submissionData,
      id: `subm-${Date.now()}`,
      moderation_status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Also insert resource into resources list as pending
    const currentResources = await this.getAllResourcesAdmin();
    setLocalItem(STORAGE_KEYS.RESOURCES, [newSubmission.resource, ...currentResources]);

    const submissions = await this.getSubmissions();
    const updated = [newSubmission, ...submissions];
    setLocalItem(STORAGE_KEYS.SUBMISSIONS, updated);
    return newSubmission;
  },

  async reviewSubmission(id: string, status: 'approved' | 'rejected', reviewerId: string, notes?: string): Promise<boolean> {
    const submissions = await this.getSubmissions();
    const index = submissions.findIndex(s => s.id === id);
    if (index === -1) return false;

    submissions[index].moderation_status = status;
    submissions[index].reviewer_id = reviewerId;
    submissions[index].reviewer_notes = notes;
    submissions[index].reviewed_at = new Date().toISOString();
    submissions[index].resource.publication_status = status === 'approved' ? 'published' : 'rejected';

    // Update resource in resources pool as well
    const resources = await this.getAllResourcesAdmin();
    const resIndex = resources.findIndex(r => r.id === submissions[index].resource.id);
    if (resIndex >= 0) {
      resources[resIndex].publication_status = status === 'approved' ? 'published' : 'rejected';
      setLocalItem(STORAGE_KEYS.RESOURCES, resources);
    }

    setLocalItem(STORAGE_KEYS.SUBMISSIONS, submissions);
    return true;
  },

  // RESOURCE REQUESTS (Students requesting notes/papers)
  async getResourceRequests(): Promise<ResourceRequest[]> {
    return getLocalItem<ResourceRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_RESOURCE_REQUESTS);
  },

  async createResourceRequest(reqData: Omit<ResourceRequest, 'id' | 'created_at' | 'votes_count' | 'status'>): Promise<ResourceRequest> {
    const newReq: ResourceRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: 'pending',
      votes_count: 1,
      created_at: new Date().toISOString(),
    };
    const current = await this.getResourceRequests();
    const updated = [newReq, ...current];
    setLocalItem(STORAGE_KEYS.REQUESTS, updated);
    return newReq;
  },

  async voteResourceRequest(id: string): Promise<number> {
    const current = await this.getResourceRequests();
    const index = current.findIndex(r => r.id === id);
    if (index === -1) return 0;
    current[index].votes_count += 1;
    setLocalItem(STORAGE_KEYS.REQUESTS, current);
    return current[index].votes_count;
  },

  async fulfillResourceRequest(id: string): Promise<boolean> {
    const current = await this.getResourceRequests();
    const index = current.findIndex(r => r.id === id);
    if (index === -1) return false;
    current[index].status = 'fulfilled';
    setLocalItem(STORAGE_KEYS.REQUESTS, current);
    return true;
  },

  // DEPARTMENT WAITLISTS (For non-CSE branches "Available Soon")
  getDepartmentWaitlistCounts(): Record<string, number> {
    const defaultCounts: Record<string, number> = {
      'ECE': 48,
      'EEE': 34,
      'MECH': 29,
      'CIVIL': 19,
      'AIDS': 52,
    };
    const stored = getLocalItem<Record<string, number>>(STORAGE_KEYS.WAITLISTS, defaultCounts);
    return stored;
  },

  joinDepartmentWaitlist(deptCode: string, email: string): { count: number } {
    const counts = this.getDepartmentWaitlistCounts();
    const current = counts[deptCode] || 15;
    counts[deptCode] = current + 1;
    setLocalItem(STORAGE_KEYS.WAITLISTS, counts);
    return { count: counts[deptCode] };
  },

  async toggleDepartmentStatus(id: string): Promise<Department | undefined> {
    const current = await this.getDepartments();
    const index = current.findIndex(d => d.id === id || d.code.toLowerCase() === id.toLowerCase());
    if (index === -1) return undefined;
    const dept = current[index];
    const newStatus = dept.status === 'active' ? 'coming_soon' : 'active';
    dept.status = newStatus;
    setLocalItem(STORAGE_KEYS.DEPARTMENTS, current);
    return dept;
  },

  // Reset demo data to defaults
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.RESOURCES);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.WAITLISTS);
  }
};
