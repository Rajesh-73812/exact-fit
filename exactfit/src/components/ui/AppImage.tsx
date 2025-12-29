'use client';

import React, { useState, CSSProperties, MouseEventHandler } from 'react';
import Image, { ImageProps } from 'next/image';

/* ================= TYPES ================= */

interface AppImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  onClick?: MouseEventHandler<HTMLImageElement>;
  fallbackSrc?: string;
}

/* ================= COMPONENT ================= */

const AppImage: React.FC<AppImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  onClick,
  fallbackSrc = '/assets/images/no_image.png',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const isExternal =
    imageSrc.startsWith('http://') || imageSrc.startsWith('https://');

  const isLocal =
    imageSrc.startsWith('/') ||
    imageSrc.startsWith('./') ||
    imageSrc.startsWith('data:');

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const commonClassName = `
    ${className}
    ${isLoading ? 'bg-gray-200' : ''}
    ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
  `.trim();

  /* ================= EXTERNAL IMAGE ================= */

  if (isExternal && !isLocal) {
    const imgStyle: CSSProperties = {};

    if (width) imgStyle.width = width;
    if (height) imgStyle.height = height;

    if (fill) {
      return (
        <div
          className={`relative ${className}`}
          style={{ width: width || '100%', height: height || '100%' }}
        >
          <img
            src={imageSrc}
            alt={alt}
            className={`${commonClassName} absolute inset-0 w-full h-full object-cover`}
            onError={handleError}
            onLoad={handleLoad}
            onClick={onClick}
            style={imgStyle}
          />
        </div>
      );
    }

    return (
      <img
        src={imageSrc}
        alt={alt}
        className={commonClassName}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
        style={imgStyle}
      />
    );
  }

  /* ================= NEXT IMAGE ================= */

  const imageProps: ImageProps = {
    src: imageSrc,
    alt,
    className: commonClassName,
    priority,
    quality,
    placeholder,
    blurDataURL,
    unoptimized: true,
    onError: handleError,
    onLoad: handleLoad,
    ...props,
  };

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          {...imageProps}
          fill
          sizes={sizes || '100vw'}
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 300}
    />
  );
};

export default AppImage;
