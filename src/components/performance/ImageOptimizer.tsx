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
