import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from './AuthContext';
import { Bookmark, Resource } from '../types';

interface BookmarkContextType {
  bookmarkedIds: Set<string>;
  bookmarks: Bookmark[];
  loading: boolean;
  isBookmarked: (resourceId: string) => boolean;
  toggleBookmark: (resource: Resource) => Promise<boolean>;
  refreshBookmarks: () => Promise<void>;
  toastMessage: string | null;
  clearToast: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarkedIds(new Set());
      setBookmarks([]);
      return;
    }
    setLoading(true);
    try {
      const data = await dataService.getBookmarks(user.id);
      setBookmarks(data);
      setBookmarkedIds(new Set(data.map(b => b.resource_id)));
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  const isBookmarked = (resourceId: string): boolean => {
    return bookmarkedIds.has(resourceId);
  };

  const toggleBookmark = async (resource: Resource): Promise<boolean> => {
    if (!user) {
      setToastMessage('Please login or switch demo user to save resources');
      return false;
    }

    try {
      const { bookmarked } = await dataService.toggleBookmark(user.id, resource.id);
      
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (bookmarked) {
          next.add(resource.id);
        } else {
          next.delete(resource.id);
        }
        return next;
      });

      if (bookmarked) {
        setToastMessage(`Saved "${resource.title.slice(0, 32)}..." to your bookmarks`);
      } else {
        setToastMessage(`Removed from bookmarks`);
      }

      await refreshBookmarks();
      return bookmarked;
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      return false;
    }
  };

  const clearToast = () => setToastMessage(null);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedIds,
        bookmarks,
        loading,
        isBookmarked,
        toggleBookmark,
        refreshBookmarks,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
