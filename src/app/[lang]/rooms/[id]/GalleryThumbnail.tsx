'use client';

import React from 'react';

interface GalleryThumbnailProps {
  image: string;
  alt: string;
}

export default function GalleryThumbnail({ image, alt }: GalleryThumbnailProps) {
  const handleClick = () => {
    window.open(image, '_blank');
  };

  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer transform transition-transform hover:scale-105"
      onClick={handleClick}
    >
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
} 