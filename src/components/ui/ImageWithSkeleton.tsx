'use client';

import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { Skeleton } from './Skeleton';

interface ImageWithSkeletonProps extends Omit<ImageProps, 'onLoad'> {
  skeletonClassName?: string;
  containerClassName?: string;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  skeletonClassName = '',
  containerClassName = '',
  className = '',
  alt,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      {!loaded && (
        <Skeleton className={`absolute inset-0 ${skeletonClassName}`} rounded="sm" />
      )}
      <Image
        {...props}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default ImageWithSkeleton;
