export function Clipboard() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 480 580"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clipboard frame */}
      <g>
        {/* Clipboard body - main rectangle */}
        <rect
          x="70"
          y="50"
          width="260"
          height="340"
          rx="12"
          fill="none"
          stroke="#E07856"
          strokeWidth="8"
        />

        {/* Clipboard clip - metal part at top */}
        <rect
          x="150"
          y="20"
          width="100"
          height="40"
          rx="6"
          fill="#1A2E5C"
        />

        {/* Clip details */}
        <rect
          x="158"
          y="28"
          width="84"
          height="6"
          rx="3"
          fill="#0F1933"
          opacity="0.6"
        />
      </g>

      {/* Clipboard content - text lines */}
      <g opacity="0.7">
        <line x1="95" y1="85" x2="310" y2="85" stroke="#E07856" strokeWidth="4" strokeLinecap="round" />
        <line x1="95" y1="115" x2="310" y2="115" stroke="#E07856" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="95" y1="145" x2="300" y2="145" stroke="#E07856" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="95" y1="175" x2="280" y2="175" stroke="#E07856" strokeWidth="3" strokeLinecap="round" />
        <line x1="95" y1="205" x2="310" y2="205" stroke="#E07856" strokeWidth="3" strokeLinecap="round" />
        <line x1="95" y1="235" x2="290" y2="235" stroke="#E07856" strokeWidth="3" strokeLinecap="round" />
        <line x1="95" y1="265" x2="310" y2="265" stroke="#E07856" strokeWidth="3" strokeLinecap="round" />
        <line x1="95" y1="295" x2="280" y2="295" stroke="#E07856" strokeWidth="3" strokeLinecap="round" />
        <line x1="95" y1="325" x2="300" y2="325" stroke="#E07856" strokeWidth="3" strokeLinecap="round" />
        <line x1="95" y1="355" x2="270" y2="355" stroke="#E07856" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Hand holding the clipboard/pen */}
      <g>
        {/* Hand palm and wrist */}
        <ellipse cx="380" cy="320" rx="42" ry="65" fill="#E8C4A0" stroke="none" />
        <path
          d="M 360 265 Q 355 240 350 210"
          fill="none"
          stroke="#E8C4A0"
          strokeWidth="22"
          strokeLinecap="round"
        />

        {/* Fingers */}
        <path
          d="M 348 255 Q 330 220 315 180"
          stroke="#E8C4A0"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 365 250 Q 365 210 360 165"
          stroke="#E8C4A0"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 380 255 Q 395 220 405 165"
          stroke="#E8C4A0"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 395 275 Q 415 245 430 190"
          stroke="#E8C4A0"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />

        {/* Thumb */}
        <path
          d="M 340 330 Q 315 335 300 360"
          stroke="#E8C4A0"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Pen/pencil in hand */}
      <g>
        {/* Pen body */}
        <line
          x1="335"
          y1="155"
          x2="300"
          y2="250"
          stroke="#1A2E5C"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Pen tip */}
        <path
          d="M 300 250 L 295 265 L 305 265 Z"
          fill="#1A2E5C"
        />

        {/* Pen eraser */}
        <rect
          x="328"
          y="148"
          width="10"
          height="14"
          fill="#E8745A"
          rx="2"
        />

        {/* Pen accent */}
        <line
          x1="335"
          y1="175"
          x2="300"
          y2="210"
          stroke="#E8745A"
          strokeWidth="2"
          opacity="0.6"
        />
      </g>

      {/* Decorative dots/elements on clipboard */}
      <g opacity="0.5">
        <circle cx="340" cy="100" r="5" fill="#E07856" />
        <circle cx="360" cy="125" r="4" fill="#E07856" />
        <circle cx="345" cy="155" r="4" fill="#E07856" />
        <circle cx="365" cy="180" r="3" fill="#E07856" />
      </g>
    </svg>
  );
}

export function DecorativeWaveLines() {
  return (
    <svg
      className="w-full h-40"
      viewBox="0 0 1200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Wavy line 1 - upper wave */}
      <path
        d="M0 60 Q 150 25, 300 50 T 600 50 T 900 50 T 1200 60"
        stroke="#E07856"
        strokeWidth="3"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />

      {/* Wavy line 2 - lower wave */}
      <path
        d="M0 110 Q 150 75, 300 100 T 600 100 T 900 100 T 1200 110"
        stroke="#E07856"
        strokeWidth="2.5"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Accent curve on right side */}
      <path
        d="M 1100 20 Q 1150 50, 1200 90"
        stroke="#F4C69F"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CurveElement() {
  return (
    <svg
      className="w-full h-24"
      viewBox="0 0 400 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 0 75 Q 100 30, 200 50 T 400 70"
        stroke="#C8C8C8"
        strokeWidth="16"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
