"use client";

import React from 'react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  variant?: 'dark' | 'light';
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  iconClassName = "w-8 h-8 md:w-10 md:h-10", 
  textClassName = "text-xl md:text-2xl font-bold tracking-tight",
  showText = true,
  variant = 'dark'
}) => {
  const logoSrc = variant === 'light' ? '/logo/logo-light.svg' : '/logo/logo-dark.svg';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoSrc}
        alt="Makani Logo"
        className={iconClassName}
      />
      {showText && (
        <span className={textClassName}>
          MAKANI
        </span>
      )}
    </div>
  );
};

export default Logo;
