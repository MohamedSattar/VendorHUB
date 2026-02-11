import { ApplicationFormData } from "@/components/SupplierApplicationForm";

interface CompanyInformationStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
}

export default function CompanyInformationStep({
  formData,
  updateFormData,
}: CompanyInformationStepProps) {
  return (
    <div className="space-y-6">
      {/* A1. Company Legal Name */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          A1. Company Legal Name (as per Trade License) *
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => updateFormData({ companyName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your company's legal name"
          required
        />
      </div>

      {/* A2. Years in Business */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          A2. Years in Business *
        </label>
        <input
          type="number"
          value={formData.yearsInBusiness}
          onChange={(e) => updateFormData({ yearsInBusiness: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., 5"
          min="0"
          required
        />
      </div>

      {/* A3. Number of Employees */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          A3. Number of Employees *
        </label>
        <input
          type="number"
          value={formData.numberOfEmployees}
          onChange={(e) => updateFormData({ numberOfEmployees: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., 50"
          min="0"
          required
        />
      </div>

      {/* A4. Trade License Type */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          A4. Trade License Type *
        </label>
        <div className="space-y-2">
          {[
            {
              value: "added",
              label: "Abu Dhabi Department of Economic Development (ADDED)",
            },
            { value: "non-added", label: "Non-ADDED" },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="tradeLicenseType"
                value={option.value}
                checked={formData.tradeLicenseType === option.value}
                onChange={(e) => updateFormData({ tradeLicenseType: e.target.value })}
                className="w-4 h-4 text-primary"
                required
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* A5. Registered Company Address - Country & City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            A5a. Country *
          </label>
          <select
            value={formData.country}
            onChange={(e) => {
              const selectedOption = e.target.options[e.target.selectedIndex];
              updateFormData({
                country: e.target.value,
                countryName: selectedOption.text,
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Country...</option>
            <option value="ae">United Arab Emirates</option>
            <option value="sa">Saudi Arabia</option>
            <option value="kw">Kuwait</option>
            <option value="qa">Qatar</option>
            <option value="bh">Bahrain</option>
            <option value="om">Oman</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Lookup field - Select from available countries
          </p>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            A5b. City *
          </label>
          <select
            value={formData.city}
            onChange={(e) => {
              const selectedOption = e.target.options[e.target.selectedIndex];
              updateFormData({
                city: e.target.value,
                cityName: selectedOption.text,
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={!formData.country}
          >
            <option value="">
              {formData.country ? "Select City..." : "Select Country First"}
            </option>
            {formData.country === "ae" && (
              <>
                <option value="abudhabi">Abu Dhabi</option>
                <option value="dubai">Dubai</option>
                <option value="sharjah">Sharjah</option>
                <option value="ajman">Ajman</option>
                <option value="ummalquwain">Umm Al Quwain</option>
                <option value="ras-al-khaimah">Ras Al Khaimah</option>
                <option value="fujairah">Fujairah</option>
              </>
            )}
            {formData.country === "sa" && (
              <>
                <option value="riyadh">Riyadh</option>
                <option value="jeddah">Jeddah</option>
                <option value="dammam">Dammam</option>
              </>
            )}
            {formData.country && formData.country !== "ae" && formData.country !== "sa" && (
              <option value="main">Main City</option>
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Lookup field - Select from available cities
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Note: An ECA team may conduct a site visit to this address.
      </p>

      {/* A6. Company Website */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          A6. Do you have a company website?
        </label>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="radio"
              id="website-no"
              name="website"
              value="no"
              checked={formData.website === "no"}
              onChange={(e) => updateFormData({ website: e.target.value })}
              className="w-4 h-4 text-primary"
            />
            <label htmlFor="website-no" className="ml-3 text-gray-700">
              No
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="website-yes"
              name="website"
              value="yes"
              checked={formData.website === "yes"}
              onChange={(e) => updateFormData({ website: e.target.value })}
              className="w-4 h-4 text-primary"
            />
            <label htmlFor="website-yes" className="ml-3 text-gray-700">
              Yes
            </label>
          </div>
        </div>

        {formData.website === "yes" && (
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => updateFormData({ websiteUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-3"
            placeholder="https://example.com"
          />
        )}
      </div>

      {/* A7. SME or Locally Owned Emirati Company */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          A7. Are you an SME or locally owned Emirati company?
        </label>
        <div className="space-y-2">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ].map((option) => (
            <label key={String(option.value)} className="flex items-center">
              <input
                type="radio"
                name="emiratiSME"
                checked={formData.isEmiratiSME === option.value}
                onChange={() => updateFormData({ isEmiratiSME: option.value })}
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* A8. Khalifa Fund Registration */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          A8. Are you an SME registered with Khalifa Fund in the SME Champion Portal?
        </label>
        <div className="space-y-2">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ].map((option) => (
            <label key={String(option.value)} className="flex items-center">
              <input
                type="radio"
                name="khalifaFund"
                checked={formData.isKhalifaFundRegistered === option.value}
                onChange={() => updateFormData({ isKhalifaFundRegistered: option.value })}
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        {!formData.isKhalifaFundRegistered && (
          <p className="text-xs text-gray-600 mt-2 bg-blue-50 p-3 rounded">
            If not yet registered, we request you to register in the Khalifa Fund SME Champion portal:{" "}
            <a href="https://www.smechampions.ae" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              https://www.smechampions.ae
            </a>
          </p>
        )}
      </div>

      {/* A9. ICV Certificate */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          A9. Do you have an ICV Certificate?
        </label>
        <div className="space-y-2">
          {[
            { value: false, label: "No" },
            { value: true, label: "Yes" },
          ].map((option) => (
            <label key={String(option.value)} className="flex items-center">
              <input
                type="radio"
                name="icvCertificate"
                checked={formData.hasICVCertificate === option.value}
                onChange={() => updateFormData({ hasICVCertificate: option.value })}
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>

        {formData.hasICVCertificate && (
          <input
            type="text"
            value={formData.icvScore}
            onChange={(e) => updateFormData({ icvScore: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-3"
            placeholder="Please provide your ICV Score"
          />
        )}

        <p className="text-xs text-gray-600 mt-3 bg-yellow-50 p-3 rounded">
          Note: If you do not yet have an ICV Certificate, we strongly encourage you to obtain one, as it enhances your competitiveness 
          in government procurement and reflects your contribution to the UAE's economic development.{" "}
          <a href="#" className="text-primary hover:underline">
            MOIAT Link
          </a>
        </p>
      </div>
    </div>
  );
}
