export default function ECALogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo square */}
      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F70b9b0a609c24ee0bbf265ba4136c987%2F53bdd76334704eacbaa9883d2f4e84ab?format=webp&width=800"
          alt="ECA Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Text branding */}
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-bold text-navy">Al Marsa</span>
        <span className="text-xs font-bold text-orange-500">VENDOR HUB</span>
      </div>
    </div>
  );
}
