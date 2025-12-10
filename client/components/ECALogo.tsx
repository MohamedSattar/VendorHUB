export default function ECALogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo square */}
      <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
        <svg
          className="w-7 h-7"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Person icon */}
          <circle cx="24" cy="14" r="6" fill="white" />
          <path
            d="M 24 22 C 32 22 38 26 38 32 L 38 38 Q 38 40 36 40 L 12 40 Q 10 40 10 38 L 10 32 C 10 26 16 22 24 22 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Text branding */}
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-bold text-navy">ECA</span>
        <span className="text-xs font-bold text-orange-500">VENDOR HUB</span>
      </div>
    </div>
  );
}
