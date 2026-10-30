import React from 'react';

export interface HireMentorLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'violet' | 'light' | 'duo' | 'monochrome';
  animated?: boolean;
  withWordmark?: boolean;
  stacked?: boolean;
  tagline?: boolean;
  className?: string;
}

/**
 * HireMentor AI Vector Logo
 *
 * Visual Concept:
 * - Central modern glasses (mentor intellect)
 * - Formal necktie beneath the bridge (career readiness & professionalism)
 * - Surrounding symmetrical laurels / leaf-petals (growth, mentorship, academic achievement)
 * - Colors: Deep Violet (#502D55), Dusty Plum (#935073), Warm Blush (#F6DBC0), Soft Ivory (#F8F4E9)
 */
export const HireMentorLogo: React.FC<HireMentorLogoProps> = ({
  size = 'md',
  variant = 'duo',
  animated = false,
  withWordmark = false,
  stacked = false,
  tagline = false,
  className = '',
}) => {
  // Dimension mapping
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 22;
      case 'sm':
        return 32;
      case 'md':
        return 44;
      case 'lg':
        return 72;
      case 'xl':
        return 120;
      default:
        return 44;
    }
  };

  const dim = getDimension();

  // Color mapping based on variant
  // Deep Violet: #502D55, Dusty Plum: #935073, Warm Blush: #F6DBC0, Soft Ivory: #F8F4E9
  let primaryStroke = '#502D55';
  let secondaryStroke = '#935073';
  let accentFill = '#F6DBC0';
  let glassesFill = '#F8F4E9';
  let tieFill = '#935073';

  if (variant === 'light') {
    // When placed on Deep Violet (#502D55) background
    primaryStroke = '#F8F4E9';
    secondaryStroke = '#F6DBC0';
    accentFill = '#F6DBC0';
    glassesFill = '#502D55';
    tieFill = '#F6DBC0';
  } else if (variant === 'violet') {
    // Monochromatic Deep Violet
    primaryStroke = '#502D55';
    secondaryStroke = '#502D55';
    accentFill = '#935073';
    glassesFill = 'none';
    tieFill = '#502D55';
  } else if (variant === 'duo') {
    // Balanced Duo: Deep Violet structure + Dusty Plum tie & leaves + Warm Blush highlights
    primaryStroke = '#502D55';
    secondaryStroke = '#935073';
    accentFill = '#F6DBC0';
    glassesFill = '#FFFFFF';
    tieFill = '#935073';
  }

  // Animation style helpers
  const getLeafAnim = (delayMs: number) => {
    if (!animated) return {};
    return {
      animation: `hirementor-leaf-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both`,
      animationDelay: `${delayMs}ms`,
    };
  };

  const getGlassesAnim = () => {
    if (!animated) return {};
    return {
      animation: 'hirementor-focus-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
      animationDelay: '300ms',
    };
  };

  const getTieAnim = () => {
    if (!animated) return {};
    return {
      animation: 'hirementor-drop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
      animationDelay: '450ms',
    };
  };

  const svgContent = (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300"
      aria-label="HireMentor AI Logo: Glasses with Tie & Laurel Petals"
      role="img"
    >
      <defs>
        {/* Soft lens sheen gradient */}
        <linearGradient id="lensSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentFill} stopOpacity="0.4" />
          <stop offset="60%" stopColor={glassesFill} stopOpacity="0.1" />
          <stop offset="100%" stopColor={secondaryStroke} stopOpacity="0.15" />
        </linearGradient>

        {/* Tie gradient */}
        <linearGradient id="tieGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={secondaryStroke} />
          <stop offset="100%" stopColor={primaryStroke} />
        </linearGradient>

        <style>{`
          @keyframes hirementor-leaf-in {
            0% { opacity: 0; transform: scale(0.4) rotate(-15deg); }
            100% { opacity: 1; transform: scale(1) rotate(0deg); }
          }
          @keyframes hirementor-focus-in {
            0% { opacity: 0; transform: translateY(-8px) scale(0.85); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes hirementor-drop-in {
            0% { opacity: 0; transform: translateY(8px) scale(0.8); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </defs>

      {/* ============================================================ */}
      {/* 1. SURROUNDING LAUREL / LEAF-PETAL ELEMENTS (LEFT & RIGHT) */}
      {/* ============================================================ */}

      {/* Left Laurel Leaves */}
      <g className="origin-[30px_50px]" style={getLeafAnim(100)}>
        {/* Leaf L1 (bottom-left) */}
        <path
          d="M 23 68 C 16 63 15 54 21 50 C 25 56 26 63 23 68 Z"
          fill={accentFill}
          stroke={secondaryStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Leaf L2 (mid-lower left) */}
        <path
          d="M 16 55 C 9 49 9 40 17 37 C 19 44 20 51 16 55 Z"
          fill={secondaryStroke}
          stroke={primaryStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Leaf L3 (mid-left) */}
        <path
          d="M 17 40 C 11 33 13 24 22 23 C 22 31 21 37 17 40 Z"
          fill={accentFill}
          stroke={secondaryStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Leaf L4 (top-left) */}
        <path
          d="M 25 27 C 21 19 28 13 36 15 C 34 22 30 26 25 27 Z"
          fill={secondaryStroke}
          stroke={primaryStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Laurel branch arc left */}
        <path
          d="M 26 72 C 14 58 14 36 31 20"
          stroke={secondaryStroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="0"
        />
      </g>

      {/* Right Laurel Leaves (Symmetrical) */}
      <g className="origin-[70px_50px]" style={getLeafAnim(180)}>
        {/* Leaf R1 (bottom-right) */}
        <path
          d="M 77 68 C 84 63 85 54 79 50 C 75 56 74 63 77 68 Z"
          fill={accentFill}
          stroke={secondaryStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Leaf R2 (mid-lower right) */}
        <path
          d="M 84 55 C 91 49 91 40 83 37 C 81 44 80 51 84 55 Z"
          fill={secondaryStroke}
          stroke={primaryStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Leaf R3 (mid-right) */}
        <path
          d="M 83 40 C 89 33 87 24 78 23 C 78 31 79 37 83 40 Z"
          fill={accentFill}
          stroke={secondaryStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Leaf R4 (top-right) */}
        <path
          d="M 75 27 C 79 19 72 13 64 15 C 66 22 70 26 75 27 Z"
          fill={secondaryStroke}
          stroke={primaryStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Laurel branch arc right */}
        <path
          d="M 74 72 C 86 58 86 36 69 20"
          stroke={secondaryStroke}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* ============================================================ */}
      {/* 2. CENTRAL GLASSES (MENTOR WISDOM) */}
      {/* ============================================================ */}
      <g style={getGlassesAnim()} className="origin-[50px_42px]">
        {/* Left Lens + Frame */}
        <rect
          x="27"
          y="31"
          width="18"
          height="16"
          rx="5"
          fill="url(#lensSheen)"
          stroke={primaryStroke}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Right Lens + Frame */}
        <rect
          x="55"
          y="31"
          width="18"
          height="16"
          rx="5"
          fill="url(#lensSheen)"
          stroke={primaryStroke}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Glasses Bridge (Connecting arc) */}
        <path
          d="M 45 35 C 48 33 52 33 55 35"
          stroke={primaryStroke}
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Temple Bar Accent */}
        <path
          d="M 27 34 L 23 33"
          stroke={primaryStroke}
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Right Temple Bar Accent */}
        <path
          d="M 73 34 L 77 33"
          stroke={primaryStroke}
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Subtle Lens Highlights (Intellectual Sheen) */}
        <path
          d="M 30 35 L 34 35"
          stroke={accentFill}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 58 35 L 62 35"
          stroke={accentFill}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* ============================================================ */}
      {/* 3. PROFESSIONAL TIE (CAREER MENTORSHIP) */}
      {/* ============================================================ */}
      <g style={getTieAnim()} className="origin-[50px_52px]">
        {/* Tie Knot (directly under the glasses bridge) */}
        <polygon
          points="46,50 54,50 53,56 47,56"
          fill={tieFill}
          stroke={primaryStroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Knot Accent Stitch */}
        <line
          x1="48"
          y1="53"
          x2="52"
          y2="53"
          stroke={accentFill}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Tie Body: Drops smoothly and widens, finishes with a crisp pointed V */}
        <polygon
          points="47.5,56 52.5,56 55.5,78 50,86 44.5,78"
          fill="url(#tieGradient)"
          stroke={primaryStroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Tie Center Crease / Highlight */}
        <line
          x1="50"
          y1="57"
          x2="50"
          y2="83"
          stroke={accentFill}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Subtle Diagonal Pattern Lines on Tie */}
        <line
          x1="47"
          y1="64"
          x2="53"
          y2="66"
          stroke={accentFill}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        <line
          x1="46"
          y1="72"
          x2="54"
          y2="74"
          stroke={accentFill}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );

  // If wordmark is not requested, return SVG standalone
  if (!withWordmark) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {svgContent}
      </div>
    );
  }

  // Stacked Wordmark (inspired by reference image 2: HIRE / MENTOR / AI)
  if (stacked) {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {svgContent}

        <div className="mt-4 flex flex-col items-center">
          <div className="font-black tracking-[0.22em] text-[#502D55] leading-none uppercase space-y-1">
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#502D55]">HIRE</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#935073]">MENTOR</span>
            <span className="block text-xl sm:text-2xl font-black text-[#502D55] tracking-[0.3em]">AI</span>
          </div>

          {tagline && (
            <p className="mt-4 text-xs sm:text-sm font-semibold tracking-wide text-[#935073] uppercase">
              Your AI-Powered Career Mentor
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal Wordmark for Navbars / Headers
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {svgContent}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5 font-black tracking-tight text-lg sm:text-xl">
          <span className={variant === 'light' ? 'text-[#F8F4E9]' : 'text-[#502D55]'}>
            HireMentor
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-xs font-black tracking-wider bg-[#F6DBC0] text-[#502D55]">
            AI
          </span>
        </div>
        {tagline && (
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase ${
              variant === 'light' ? 'text-[#F6DBC0]/90' : 'text-[#935073]'
            }`}
          >
            Career & Interview Mentor
          </span>
        )}
      </div>
    </div>
  );
};
