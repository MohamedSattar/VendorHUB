export function UIWireframeMockup() {
  return (
    <svg
      className="w-full max-w-sm h-auto"
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Device frame */}
      <rect
        x="50"
        y="30"
        width="300"
        height="380"
        rx="20"
        stroke="#1A2E5C"
        strokeWidth="8"
        fill="none"
      />

      {/* Screen content */}
      <g>
        {/* Header bar */}
        <rect x="65" y="50" width="270" height="40" fill="#F5F5F5" rx="4" />
        <circle cx="80" cy="67" r="3" fill="#1A2E5C" opacity="0.5" />
        <circle cx="90" cy="67" r="3" fill="#1A2E5C" opacity="0.5" />
        <circle cx="100" cy="67" r="3" fill="#1A2E5C" opacity="0.5" />

        {/* Content lines */}
        <rect x="65" y="110" width="200" height="8" fill="#E8C4A0" rx="4" />
        <rect x="65" y="130" width="150" height="6" fill="#CCCCCC" rx="3" />

        {/* Image placeholder */}
        <rect x="75" y="160" width="250" height="120" fill="#E8C4A0" rx="8" />
        <line
          x1="75"
          y1="160"
          x2="325"
          y2="280"
          stroke="#1A2E5C"
          strokeWidth="2"
          opacity="0.3"
        />
        <line
          x1="325"
          y1="160"
          x2="75"
          y2="280"
          stroke="#1A2E5C"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Grid buttons */}
        <g>
          <rect x="75" y="300" width="55" height="55" fill="none" stroke="#1A2E5C" strokeWidth="1.5" rx="4" />
          <line x1="85" y1="310" x2="110" y2="335" stroke="#1A2E5C" strokeWidth="1.5" />
          <line x1="110" y1="310" x2="85" y2="335" stroke="#1A2E5C" strokeWidth="1.5" />

          <rect x="145" y="300" width="55" height="55" fill="none" stroke="#1A2E5C" strokeWidth="1.5" rx="4" />
          <circle cx="172.5" cy="327.5" r="12" fill="none" stroke="#1A2E5C" strokeWidth="1.5" />

          <rect x="215" y="300" width="55" height="55" fill="none" stroke="#1A2E5C" strokeWidth="1.5" rx="4" />
          <rect x="225" y="310" width="15" height="15" fill="#1A2E5C" />
          <rect x="245" y="310" width="15" height="15" fill="#1A2E5C" />
          <rect x="225" y="330" width="15" height="15" fill="#1A2E5C" />
          <rect x="245" y="330" width="15" height="15" fill="#1A2E5C" />

          <rect x="285" y="300" width="55" height="55" fill="none" stroke="#1A2E5C" strokeWidth="1.5" rx="4" />
          <line x1="295" y1="325" x2="320" y2="325" stroke="#1A2E5C" strokeWidth="1.5" />
        </g>

        {/* Bottom lines */}
        <rect x="65" y="370" width="270" height="3" fill="#CCCCCC" rx="1.5" />
        <rect x="65" y="380" width="270" height="3" fill="#CCCCCC" rx="1.5" />
      </g>

      {/* Hand holding device */}
      <g>
        {/* Palm */}
        <ellipse cx="320" cy="380" rx="50" ry="60" fill="#E8C4A0" stroke="none" />

        {/* Fingers */}
        <path
          d="M 310 320 Q 300 280 295 250"
          stroke="#E8C4A0"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 330 310 Q 335 260 340 220"
          stroke="#E8C4A0"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 350 320 Q 360 270 365 220"
          stroke="#E8C4A0"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />

        {/* Pen/stylus */}
        <line
          x1="340"
          y1="200"
          x2="355"
          y2="280"
          stroke="#1A2E5C"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="355" cy="280" r="5" fill="#1A2E5C" />
      </g>
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
