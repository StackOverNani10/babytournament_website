import React from 'react';
import { GalleryProvider } from '@/context/gallery/GalleryContext';
import PhotoGallery from '../components/PhotoGallery';

const GalleryPage: React.FC = () => {
  return (
    <GalleryProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <PhotoGallery />
      </div>
    </GalleryProvider>
  );
};

export default GalleryPage;
