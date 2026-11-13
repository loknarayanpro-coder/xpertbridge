-- ==============================================================================
-- XPERTBRIDGE - CLEAN IDEMPOTENT DATABASE MIGRATION & RLS POLICIES
-- Platform: Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Safe creation)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE resource_type_enum AS ENUM ('notes', 'important_questions', 'question_paper', 'reference_material', 'syllabus');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE publication_status_enum AS ENUM ('published', 'pending', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE exam_type_enum AS ENUM ('End Semester Exam', 'Internal Assessment 1', 'Internal Assessment 2', 'Model Examination');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'student'::user_role,
  college TEXT DEFAULT 'College Campus',
  department_id UUID,
  department_code TEXT DEFAULT 'CSE',
  academic_year INT DEFAULT 1 CHECK (academic_year BETWEEN 1 AND 4),
  semester INT DEFAULT 1 CHECK (semester BETWEEN 1 AND 8),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_name TEXT DEFAULT 'building',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject_code TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  department_code TEXT NOT NULL,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
  academic_year INT NOT NULL CHECK (academic_year BETWEEN 1 AND 4),
  regulation TEXT NOT NULL DEFAULT 'R2021',
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  subject_name TEXT,
  subject_code TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  department_code TEXT,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
  academic_year INT NOT NULL DEFAULT 1 CHECK (academic_year BETWEEN 1 AND 4),
  resource_type resource_type_enum NOT NULL DEFAULT 'notes'::resource_type_enum,
  unit_number INT CHECK (unit_number BETWEEN 1 AND 5),
  units_label TEXT,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploader_name TEXT NOT NULL DEFAULT 'Academic Admin',
  uploader_avatar TEXT,
  publication_status publication_status_enum NOT NULL DEFAULT 'published'::publication_status_enum,
  download_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- VIEW ALIAS: materials (so queries to 'materials' work seamlessly)
CREATE OR REPLACE VIEW public.materials AS
  SELECT 
    id,
    title,
    description,
    department_code AS department,
    semester,
    subject_id,
    resource_type AS material_type,
    storage_path AS file_path,
    uploaded_by,
    created_at
  FROM public.resources;

-- 7. QUESTION PAPER METADATA TABLE
CREATE TABLE IF NOT EXISTS public.question_paper_metadata (
  resource_id UUID PRIMARY KEY REFERENCES public.resources(id) ON DELETE CASCADE,
  examination_year INT NOT NULL,
  examination_type exam_type_enum NOT NULL DEFAULT 'End Semester Exam'::exam_type_enum,
  regulation TEXT NOT NULL DEFAULT 'R2021',
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8)
);

-- 8. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_bookmark UNIQUE (user_id, resource_id)
);

-- 9. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  moderation_status publication_status_enum NOT NULL DEFAULT 'pending'::publication_status_enum,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. INDEXES
CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_department ON public.resources(department_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(publication_status);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON public.subjects(department_id);

-- 11. AUTOMATIC PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, role, department_code, semester)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
    COALESCE(NEW.raw_user_meta_data->>'department_code', 'CSE'),
    COALESCE((NEW.raw_user_meta_data->>'semester')::int, 1)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. HELPER FUNCTION: IS_ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_paper_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Clean existing policies so this script can be re-run anytime safely
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Departments viewable by everyone" ON public.departments;
DROP POLICY IF EXISTS "Admins manage departments" ON public.departments;
DROP POLICY IF EXISTS "Departments are viewable by everyone" ON public.departments;
DROP POLICY IF EXISTS "Admins can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can update departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can delete departments" ON public.departments;

CREATE POLICY "Departments viewable by everyone" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins manage departments" ON public.departments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Subjects viewable by everyone" ON public.subjects;
DROP POLICY IF EXISTS "Admins manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON public.subjects;
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;

CREATE POLICY "Subjects viewable by everyone" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Published resources viewable by everyone" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can submit resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can update any resource" ON public.resources;
DROP POLICY IF EXISTS "Admins can delete any resource" ON public.resources;

CREATE POLICY "Published resources viewable by everyone" ON public.resources 
  FOR SELECT USING (publication_status = 'published'::publication_status_enum OR public.is_admin() OR auth.uid() = uploaded_by);
CREATE POLICY "Authenticated users can submit resources" ON public.resources 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update any resource" ON public.resources 
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete any resource" ON public.resources 
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "QP metadata viewable by everyone" ON public.question_paper_metadata;
DROP POLICY IF EXISTS "Admins can manage QP metadata" ON public.question_paper_metadata;

CREATE POLICY "QP metadata viewable by everyone" ON public.question_paper_metadata FOR SELECT USING (true);
CREATE POLICY "Admins can manage QP metadata" ON public.question_paper_metadata FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;

CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students view own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students insert submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can view their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.submissions;

CREATE POLICY "Students view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Students insert submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update submissions" ON public.submissions FOR UPDATE USING (public.is_admin());

-- 14. SEED DEFAULT DEPARTMENTS
INSERT INTO public.departments (name, code, description, icon_name)
VALUES
  ('Computer Science & Engineering', 'CSE', 'Algorithms, Data Structures, AI, Web and Cloud Computing', 'code'),
  ('Electronics & Communication', 'ECE', 'VLSI, Signal Processing, Embedded Systems and IoT', 'cpu'),
  ('Electrical & Electronics', 'EEE', 'Power Systems, Control Engineering and Microgrids', 'zap'),
  ('Mechanical Engineering', 'MECH', 'Thermodynamics, CAD/CAM and Fluid Mechanics', 'settings'),
  ('Civil Engineering', 'CIVIL', 'Structural Analysis, Surveying and Construction Tech', 'building'),
  ('Information Technology', 'IT', 'Software Engineering, Networks, Database Systems and Cybersecurity', 'database')
ON CONFLICT (code) DO NOTHING;
