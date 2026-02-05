import React from 'react';
import { Icon } from '@iconify-icon/react';

interface ArrowLinkProps {
  children: React.ReactNode;
  className?: string;
  arrowIcon?: string;
  arrowUp?: boolean;
}

export default function ArrowLink({ children, className = '', arrowIcon = 'solar:arrow-right-linear', arrowUp = false }: ArrowLinkProps) {
  return (
    <a href="#" className={`inline-flex items-center gap-2 ${className}`}>
      <span>{children}</span>
      <Icon 
        icon={arrowUp ? 'solar:arrow-right-up-linear' : arrowIcon} 
        width={arrowUp ? 16 : 20}
        className="group-hover/btn:translate-x-1 transition-transform"
      />
    </a>
  );
}
