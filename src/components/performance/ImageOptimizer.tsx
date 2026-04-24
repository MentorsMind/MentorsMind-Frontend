import React, { useEffect, useRef, useState } from 'react'
import { buildWebpSource } from '../../utils/performance.utils'

interface ImageOptimizerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
}

export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({ src, alt, placeholder, ...rest }) => {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = imgRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const webp = buildWebpSource(src)

  return (
    <picture>
      {webp && <source srcSet={webp} type="image/webp" />}
      {placeholder && !visible ? (
        <img src={placeholder} alt={alt} ref={imgRef} {...rest} />
      ) : (
        <img src={src} alt={alt} loading="lazy" ref={imgRef} {...rest} />
      )}
    </picture>
  )
}

export default ImageOptimizer
import React from 'react';
import { buildWebpSource } from '../../utils/performance.utils';

interface ImageOptimizerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className,
  containerClassName,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'low',
  ...rest
}) => {
  const webpSource = buildWebpSource(typeof src === 'string' ? src : undefined);

  if (!src) return null;

  return (
    <picture className={containerClassName}>
      {webpSource && <source srcSet={webpSource} type="image/webp" />}
      <img
        src={typeof src === 'string' ? src : undefined}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        {...rest}
      />
    </picture>
  );
};

export default ImageOptimizer;
