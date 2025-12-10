export function UIWireframeMockup() {
  return (
    <svg
      className="w-full h-auto"
      viewBox="0 0 450 550"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clipboard body */}
      <rect
        x="60"
        y="40"
        width="240"
        height="320"
        rx="8"
        fill="none"
        stroke="#D97534"
        strokeWidth="6"
      />

      {/* Clipboard clip */}
      <rect
        x="140"
        y="20"
        width="80"
        height="35"
        rx="4"
        fill="#1A2E5C"
      />

      {/* Paper/page content lines */}
      <line x1="85" y1="80" x2="280" y2="80" stroke="#D97534" strokeWidth="3" opacity="0.6" />
      <line x1="85" y1="110" x2="280" y2="110" stroke="#D97534" strokeWidth="3" opacity="0.6" />
      <line x1="85" y1="140" x2="280" y2="140" stroke="#D97534" strokeWidth="3" opacity="0.6" />
      <line x1="85" y1="170" x2="240" y2="170" stroke="#D97534" strokeWidth="2" opacity="0.5" />
      <line x1="85" y1="195" x2="260" y2="195" stroke="#D97534" strokeWidth="2" opacity="0.5" />
      <line x1="85" y1="220" x2="250" y2="220" stroke="#D97534" strokeWidth="2" opacity="0.5" />
      <line x1="85" y1="245" x2="240" y2="245" stroke="#D97534" strokeWidth="2" opacity="0.5" />
      <line x1="85" y1="270" x2="270" y2="270" stroke="#D97534" strokeWidth="2" opacity="0.5" />
      <line x1="85" y1="295" x2="260" y2="295" stroke="#D97534" strokeWidth="2" opacity="0.5" />
      <line x1="85" y1="320" x2="240" y2="320" stroke="#D97534" strokeWidth="2" opacity="0.5" />

      {/* Decorative pattern on clipboard */}
      <circle cx="310" cy="60" r="4" fill="#D97534" opacity="0.4" />
      <circle cx="330" cy="80" r="3" fill="#D97534" opacity="0.4" />
      <circle cx="320" cy="100" r="4" fill="#D97534" opacity="0.4" />
      <circle cx="340" cy="120" r="3" fill="#D97534" opacity="0.4" />

      {/* Hand holding pen/pencil */}
      <g>
        {/* Hand palm */}
        <path
          d="M 350 280 Q 360 260 370 240 Q 380 220 385 200"
          fill="#E8C4A0"
          stroke="#D97534"
          strokeWidth="2"
        />
        <ellipse cx="370" cy="300" rx="35" ry="50" fill="#E8C4A0" stroke="#D97534" strokeWidth="2" />

        {/* Fingers */}
        <path
          d="M 345 260 Q 330 240 320 210"
          stroke="#E8C4A0"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 360 250 Q 360 220 355 190"
          stroke="#E8C4A0"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 375 260 Q 385 230 390 200"
          stroke="#E8C4A0"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 390 280 Q 405 260 415 220"
          stroke="#E8C4A0"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Thumb */}
        <path
          d="M 330 310 Q 310 310 300 330"
          stroke="#E8C4A0"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Pen/pencil */}
      <g>
        <line
          x1="310"
          y1="180"
          x2="280"
          y2="130"
          stroke="#1A2E5C"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="310" cy="180" r="4" fill="#1A2E5C" />
        <polygon points="310,180 318,190 302,190" fill="#1A2E5C" />
      </g>

      {/* Eraser on pencil */}
      <rect
        x="276"
        y="126"
        width="8"
        height="12"
        fill="#FF6B4A"
        rx="2"
      />
    </svg>
  );
}

export function DecorativeWaves() {
  return (
    <svg
      className="w-full h-24"
      viewBox="0 0 800 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wave 1 */}
      <path
        d="M0 50 Q 100 40, 200 50 T 400 50 T 600 50 T 800 50"
        stroke="#A0A0A0"
        strokeWidth="2"
        fill="none"
      />

      {/* Wave 2 */}
      <path
        d="M0 30 Q 100 20, 200 30 T 400 30 T 600 30 T 800 30"
        stroke="#5A9FA5"
        strokeWidth="2"
        fill="none"
      />

      {/* Wave 3 */}
      <path
        d="M0 70 Q 100 60, 200 70 T 400 70 T 600 70 T 800 70"
        stroke="#5A9FA5"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export function CurveElement() {
  return (
    <svg
      className="w-full h-32"
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 0 80 Q 100 20, 200 40 T 400 60"
        stroke="#C0C0C0"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
