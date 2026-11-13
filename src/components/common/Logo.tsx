import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'light' | 'dark' | 'white';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  showTagline = true,
  size = 'md',
}) => {
  const isLight = variant === 'light' || variant === 'white';
  const textColor = isLight ? 'text-white' : 'text-[#102C4B]';
  const subColor = isLight ? 'text-slate-300' : 'text-slate-500';

  const sizeClasses = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-8 h-8', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group select-none">
      {/* Graduation Cap & Bridge Emblem matching reference */}
      <div className={`relative ${sizeClasses.icon} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform group-hover:scale-105 duration-200"
        >
          {/* Graduation Cap */}
          <path
            d="M18 6L3 13.5L18 21L33 13.5L18 6Z"
            fill={isLight ? '#FFFFFF' : '#102C4B'}
          />
          <path
            d="M8 16V23C8 23 11 26 18 26C25 26 28 23 28 23V16"
            stroke={isLight ? '#FFFFFF' : '#102C4B'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Cyan Bridge Arc Accent underneath */}
          <path
            d="M6 31C9 28 13.5 26 18 26C22.5 26 27 28 30 31"
            stroke="#00D2D3"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Tassel */}
          <path
            d="M30 15V22"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="30" cy="22.5" r="1.5" fill="#2563EB" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-black ${sizeClasses.text} tracking-tight ${textColor} uppercase leading-none`}>
          Xpert<span className="text-blue-600">Bridge</span>
        </span>
        {showTagline && (
          <span className={`${sizeClasses.sub} font-medium tracking-wide ${subColor} leading-none mt-1`}>
            Learn • Prepare • Grow
          </span>
        )}
      </div>
    </Link>
  );
};
