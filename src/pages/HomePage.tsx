import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { DepartmentGrid } from '../components/home/DepartmentGrid';
import { PopularNotesSection } from '../components/home/PopularNotesSection';
import { RecentlyAddedGrid } from '../components/home/RecentlyAddedGrid';
import { LandingAuthFeaturesSection } from '../components/home/LandingAuthFeaturesSection';
import { PdfViewerModal } from '../components/resources/PdfViewerModal';
import { UploadResourceModal } from '../components/resources/UploadResourceModal';
import { dataService } from '../lib/dataService';
import { Department, Resource } from '../types';
import { UploadCloud, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [popularNotes, setPopularNotes] = useState<Resource[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Resource[]>([]);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHomeData = async () => {
    try {
      const [depts, popular, recent] = await Promise.all([
        dataService.getDepartments(),
        dataService.getPopularNotes(5),
        dataService.getRecentlyAdded(4),
      ]);
      setDepartments(depts);
      setPopularNotes(popular);
      setRecentlyAdded(recent);
    } catch (err) {
      console.error('Error loading homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      
      {/* 1. Hero Section matching reference image */}
      <HeroSection />

      {/* 2. Explore by Department */}
      <DepartmentGrid departments={departments} />

      {/* 3. Popular Notes + Previous Year Question Papers & Quick Filters */}
      <PopularNotesSection
        popularNotes={popularNotes}
        departments={departments}
        onQuickView={(res) => setPreviewResource(res)}
      />

      {/* 4. Recently Added Notes and Question Papers */}
      <RecentlyAddedGrid
        resources={recentlyAdded}
        onQuickView={(res) => setPreviewResource(res)}
      />

      {/* 5. Dual Role Portals, Platform Benefits & Auth CTAs */}
      <LandingAuthFeaturesSection />



      {/* PDF Viewer Modal */}
      <PdfViewerModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      {/* Upload / Submission Modal */}
      <UploadResourceModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadHomeData}
      />

    </div>
  );
};
