interface BirdIconProps {
  className?: string;
}

export default function BirdIcon({ className = '' }: BirdIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bird silhouette */}
      <path
        d="M25 35 C25 25, 30 20, 40 20 C45 20, 48 22, 50 25 C52 22, 55 20, 60 20 C70 20, 75 25, 75 35 C75 40, 73 44, 70 47 C72 50, 73 54, 73 58 C73 68, 68 73, 58 73 C55 73, 52 72, 50 70 C48 72, 45 73, 42 73 C32 73, 27 68, 27 58 C27 54, 28 50, 30 47 C27 44, 25 40, 25 35 Z"
        fill="white"
      />
      {/* Eye */}
      <circle cx="45" cy="32" r="2" fill="black" />
      {/* Beak */}
      <path
        d="M35 38 L30 40 L35 42 Z"
        fill="black"
      />
      {/* Sound wave */}
      <g transform="translate(60, 65)">
        <rect x="0" y="-8" width="3" height="4" fill="white" />
        <rect x="5" y="-10" width="3" height="6" fill="white" />
        <rect x="10" y="-12" width="3" height="8" fill="white" />
        <rect x="15" y="-10" width="3" height="6" fill="white" />
        <rect x="20" y="-8" width="3" height="4" fill="white" />
        <line x1="0" y1="0" x2="23" y2="0" stroke="white" strokeWidth="1" />
      </g>
    </svg>
  );
}

