import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate responsive image URLs
  const generateSrcSet = (baseSrc: string, widths: number[] = [320, 640, 768, 1024, 1200, 1920]) => {
    return widths
      .map(w => `${baseSrc}?w=${w}&q=${quality} ${w}w`)
      .join(', ');
  };

  // Generate WebP version if supported
  const generateWebPSrcSet = (baseSrc: string, widths: number[] = [320, 640, 768, 1024, 1200, 1920]) => {
    return widths
      .map(w => `${baseSrc}?w=${w}&q=${quality}&f=webp ${w}w`)
      .join(', ');
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  // Default sizes if not provided
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  return (
    <picture className={className}>
      {/* WebP format for modern browsers */}
      <source
        srcSet={generateWebPSrcSet(src)}
        sizes={defaultSizes}
        type="image/webp"
      />
      
      {/* Fallback for older browsers */}
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={defaultSizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding={priority ? 'sync' : 'async'}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          backgroundColor: placeholder === 'blur' && blurDataURL ? '#f3f4f6' : 'transparent'
        }}
      />
      
      {/* Loading placeholder */}
      {!imageLoaded && !imageError && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={{ width, height }}
        >
          {placeholder === 'blur' && blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover opacity-50"
              style={{ filter: 'blur(20px)' }}
            />
          )}
        </div>
      )}
      
      {/* Error placeholder */}
      {imageError && (
        <div 
          className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
          style={{ width, height }}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </picture>
  );
};

export default OptimizedImage;
