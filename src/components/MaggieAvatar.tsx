import React from 'react';

interface MaggieAvatarProps {
  size?: number;
  variant?: 'default' | 'teal-circle' | 'plum-circle';
  className?: string;
}

export const MaggieAvatar: React.FC<MaggieAvatarProps> = ({
  size = 56,
  variant = 'default',
  className = '',
}) => {
  const outerFill =
    variant === 'teal-circle'
      ? '#215B63'
      : variant === 'plum-circle'
        ? '#5C385E'
        : '#F7E7CA';

  const midAura =
    variant === 'teal-circle'
      ? '#4E795E'
      : variant === 'plum-circle'
        ? '#8B6251'
        : '#F9EBD0';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustración de Maggie, asistente educativa"
      className={className}
    >
      <circle cx="60" cy="60" r="58" fill={outerFill} />
      <circle cx="60" cy="60" r="44" fill={midAura} opacity="0.65" />

      {/* Warm golden flame / lightbulb silhouette */}
      <path
        d="M60 18C44 36 33 52 33 68C33 83.464 45.088 94 60 94C74.912 94 87 83.464 87 68C87 52 76 36 60 18Z"
        fill="#E5B047"
      />

      {/* Base */}
      <rect x="44" y="95" width="32" height="7" rx="3.5" fill="#2B6B71" />
      <rect x="49" y="103" width="22" height="6" rx="3" fill="#5E3A5E" />

      {/* Face */}
      <ellipse cx="60" cy="70" rx="18" ry="19.5" fill="#FCE5CD" />

      {/* Small heart mark on forehead */}
      <path
        d="M60 58.6C58.8 57.1 56.7 57.3 56.7 59.1C56.7 60.5 58.4 61.9 60 63.1C61.6 61.9 63.3 60.5 63.3 59.1C63.3 57.3 61.2 57.1 60 58.6Z"
        fill="#DA7872"
      />

      {/* Eyes */}
      <circle cx="52.5" cy="68.5" r="2.6" fill="#2B2340" />
      <circle cx="67.5" cy="68.5" r="2.6" fill="#2B2340" />

      {/* Warm coral cheeks */}
      <circle cx="47.5" cy="74" r="3.1" fill="#E69A92" />
      <circle cx="72.5" cy="74" r="3.1" fill="#E69A92" />

      {/* Gentle smile */}
      <path
        d="M53 75.5C55.2 78.6 64.8 78.6 67 75.5"
        stroke="#2B2340"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
};
