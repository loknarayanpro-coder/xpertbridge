import React from 'react';
import { Link } from 'react-router-dom';
import { Resource } from '../../types';
import { ResourceCard } from '../resources/ResourceCard';
import { ArrowRight } from 'lucide-react';

interface RecentlyAddedGridProps {
  resources: Resource[];
  onQuickView?: (resource: Resource) => void;
}

export const RecentlyAddedGrid: React.FC<RecentlyAddedGridProps> = ({
  resources,
  onQuickView,
}) => {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching reference */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102C4B] tracking-tight">
              Recently Added
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Latest notes and question papers uploaded by your peers.
            </p>
          </div>

          <Link
            to="/notes?sort=newest"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              variant="card"
              onQuickView={onQuickView}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
