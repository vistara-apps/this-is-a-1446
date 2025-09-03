import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading indicator component
 * @param {Object} props - Component props
 * @param {string} props.text - Loading text
 * @param {string} props.size - Size of the loader (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
export function LoadingIndicator({ text = 'Loading...', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-white animate-spin mb-2`} />
      {text && <p className="text-white/70 text-sm">{text}</p>}
    </div>
  );
}

