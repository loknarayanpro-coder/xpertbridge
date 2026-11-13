export type Role = 'student' | 'admin';

export type ResourceType = 'notes' | 'important_questions' | 'question_paper' | 'reference_material' | 'syllabus';

export type PublicationStatus = 'published' | 'pending' | 'rejected';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type ExamType = 'End Semester Exam' | 'Internal Assessment 1' | 'Internal Assessment 2' | 'Model Examination';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  college: string;
  department_id?: string;
  department_code?: string;
  academic_year?: number;
  semester?: number;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  icon_name: 'code' | 'cpu' | 'zap' | 'settings' | 'building' | 'database';
  total_subjects: number;
  total_resources: number;
  status?: 'active' | 'coming_soon';
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  subject_code: string;
  department_id: string;
  department_code: string;
  semester: number;
  academic_year: number;
  regulation: string; // e.g. R2021, R2017
  description: string;
  units: {
    unit_number: number;
    title: string;
    description: string;
  }[];
  created_at: string;
}

export interface QuestionPaperMetadata {
  resource_id: string;
  examination_year: number;
  examination_type: ExamType;
  regulation: string;
  semester: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  department_id: string;
  department_code?: string;
  semester: number;
  academic_year: number;
  resource_type: ResourceType;
  unit_number?: number | null; // e.g., 1 to 5, or null for full subject
  units_label?: string; // e.g., "Unit 1-4", "Unit 1-5", "Unit 3"
  storage_path: string;
  original_filename: string;
  file_size: number; // in bytes
  file_size_formatted: string;
  mime_type: string;
  uploaded_by: string;
  uploader_name: string;
  uploader_avatar?: string;
  publication_status: PublicationStatus;
  download_count: number;
  question_paper?: QuestionPaperMetadata;
  sample_content?: string[]; // Academic syllabus text for mock document preview
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
  resource?: Resource;
}

export interface Submission {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  resource: Resource;
  moderation_status: ModerationStatus;
  reviewer_id?: string;
  reviewer_notes?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface ResourceRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  department_code: string;
  subject_code: string;
  subject_name: string;
  semester: number;
  resource_type: ResourceType;
  unit_number?: number | null;
  details: string;
  status: 'pending' | 'fulfilled' | 'in_progress';
  votes_count: number;
  created_at: string;
}

export interface ResourceFilters {
  searchQuery: string;
  departmentId: string;
  semester: string;
  academicYear: string;
  subjectId: string;
  unit: string;
  resourceType: string;
  regulation: string;
  examYear: string;
  sortBy: 'newest' | 'popular' | 'alphabetical';
}
