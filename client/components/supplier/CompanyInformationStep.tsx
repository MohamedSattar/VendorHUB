import { ApplicationFormData } from "@/components/SupplierApplicationForm";
import { useState, useEffect, useRef, useCallback } from "react";
import { Loader, Info } from "lucide-react";

interface Country {
  prmtk_countryid: string;
  prmtk_name: string;
}

interface City {
  prmtk_cityid: string;
  prmtk_name: string;
  _prmtk_country_value: string;
}

interface CompanyInformationStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onTradeLicenseCheck?: (tradeLicense: string) => Promise<void>;
  isCheckingDuplicate?: boolean;
  duplicateError?: string | null;
}

interface InfoTipProps {
  text: string;
}

function InfoTip({ text }: InfoTipProps) {
  return (
    <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-blue-700">{text}</p>
    </div>
  );
}

export default function CompanyInformationStep({
  formData,
  updateFormData,
  onTradeLicenseCheck,
  isCheckingDuplicate = false,
  duplicateError = null,
}: CompanyInformationStepProps) {
  const [tradeLicenseInput, setTradeLicenseInput] = useState(formData.tradeLicenseNumber);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  // Cache for cities by country to avoid duplicate API calls
  const citiesCacheRef = useRef<Record<string, City[]>>({});

  // Load countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        setCountriesError(null);
        const response = await fetch("/api/odata/countries");

        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }

        const data = await response.json();
        setCountries(data);
        console.log("[CompanyInformationStep] Countries loaded:", data.length);

        // Set default country to UAE if form country is empty
        if (!formData.country) {
          const uae = data.find(
            (c: Country) => c.prmtk_name === "United Arab Emirates"
          );
          if (uae) {
            console.log("[CompanyInformationStep] Setting default country to UAE");
            updateFormData({
              country: uae.prmtk_countryid,
              countryName: uae.prmtk_name,
            });
          }
        }
      } catch (error) {
        console.error("[CompanyInformationStep] Error loading countries:", error);
        setCountriesError("Failed to load countries. Please refresh the page.");
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Load cities when country is selected - optimized with caching
  useEffect(() => {
    if (!formData.country) {
      setCities([]);
      return;
    }

    // Check if we have cached cities for this country
    if (citiesCacheRef.current[formData.country]) {
      console.log("[CompanyInformationStep] Using cached cities for country:", formData.country);
      setCities(citiesCacheRef.current[formData.country]);
      updateFormData({ city: "", cityName: "" });
      return;
    }

    const fetchCities = async () => {
      try {
        setIsLoadingCities(true);
        setCitiesError(null);
        const response = await fetch(
          `/api/odata/cities?countryId=${encodeURIComponent(formData.country)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }

        const data = await response.json();

        // Cache the result for future use
        citiesCacheRef.current[formData.country] = data;

        setCities(data);
        console.log("[CompanyInformationStep] Cities loaded and cached:", {
          countryId: formData.country,
          citiesCount: data.length,
        });

        // Set default city to Abu Dhabi if form city is empty and we're in UAE
        if (!formData.city && data.length > 0) {
          const abuDhabi = data.find(
            (c: City) => c.prmtk_name === "Abu Dhabi"
          );
          if (abuDhabi) {
            console.log("[CompanyInformationStep] Setting default city to Abu Dhabi");
            updateFormData({
              city: abuDhabi.prmtk_cityid,
              cityName: abuDhabi.prmtk_name,
            });
          } else {
            // If Abu Dhabi not found, reset city selection
            updateFormData({ city: "", cityName: "" });
          }
        } else if (!formData.city) {
          // Reset city selection when country changes
          updateFormData({ city: "", cityName: "" });
        }
      } catch (error) {
        console.error("[CompanyInformationStep] Error loading cities:", error);
        setCitiesError("Failed to load cities for this country.");
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
    // Only depend on formData.country - remove updateFormData dependency
    // to prevent unnecessary re-runs when the parent function reference changes
  }, [formData.country]);

  // Memoize the update function to ensure it's stable
  const handleUpdateFormData = useCallback(
    (updates: Partial<ApplicationFormData>) => {
      updateFormData(updates);
    },
    [updateFormData]
  );

  const handleTradeLicenseBlur = async () => {
    if (onTradeLicenseCheck && tradeLicenseInput.trim()) {
      await onTradeLicenseCheck(tradeLicenseInput);
    }
  };

  return (
    <div className="space-y-8">
      {/* Trade License Number - Unique Identifier */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          Trade License Number <span className="text-red-600">*</span>
        </label>
        <p className="text-xs text-gray-600 mb-2">
          This is the unique identifier for your supplier registration. If a record with this number already exists, it will be automatically populated.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={tradeLicenseInput}
            onChange={(e) => setTradeLicenseInput(e.target.value)}
            onBlur={handleTradeLicenseBlur}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your trade license number"
            required
          />
          {isCheckingDuplicate && (
            <div className="flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Loader size={16} className="animate-spin text-primary" />
              <span className="ml-2 text-sm text-primary">Checking...</span>
            </div>
          )}
        </div>
        {duplicateError && (
          <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">{duplicateError}</p>
        )}
        <InfoTip text="Your trade license number is the unique identifier for your supplier registration. The system will check for existing records to avoid duplicates. If found, your previous data will be automatically populated." />
      </div>

      {/* Company Legal Name */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          Company Legal Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => handleUpdateFormData({ companyName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your company's legal name"
          required
        />
        <InfoTip text="Enter the exact legal name of your company as it appears on your trade license. This should match your official registration documents." />
      </div>

      {/* Years in Business */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          Years in Business <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          value={formData.yearsInBusiness}
          onChange={(e) => handleUpdateFormData({ yearsInBusiness: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., 5"
          min="0"
          required
        />
        <InfoTip text="Enter the number of years your company has been in business. This helps us understand your operational experience and track record." />
      </div>

      {/* Number of Employees */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">
          Number of Employees <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          value={formData.numberOfEmployees}
          onChange={(e) => handleUpdateFormData({ numberOfEmployees: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., 50"
          min="0"
          required
        />
        <InfoTip text="Indicate the total number of employees in your company. This is used to assess your organization's size and capacity." />
      </div>

      {/* Trade License Type */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          Trade License Type <span className="text-red-600">*</span>
        </label>
        <div className="space-y-2">
          {[
            {
              value: 1,
              label: "Abu Dhabi Department of Economic Development (ADDED)",
            },
            { value: 2, label: "Non-ADDED" },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="tradeLicenseType"
                value={option.value}
                checked={formData.tradeLicenseType === option.value}
                onChange={(e) => handleUpdateFormData({ tradeLicenseType: parseInt(e.target.value) })}
                className="w-4 h-4 text-primary"
                required
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        <InfoTip text="Select the authority that issued your trade license. ADDED licenses are issued by the Abu Dhabi Department of Economic Development." />
      </div>

      {/* Registered Company Address - Country & City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Country <span className="text-red-600">*</span>
          </label>
          {countriesError && (
            <p className="text-xs text-red-600 mb-2 bg-red-50 p-2 rounded">{countriesError}</p>
          )}
          <select
            value={formData.country}
            onChange={(e) => {
              handleUpdateFormData({
                country: e.target.value,
                countryName: e.target.options[e.target.selectedIndex].text,
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={isLoadingCountries}
          >
            <option value="">
              {isLoadingCountries ? "Loading countries..." : "Select Country..."}
            </option>
            {countries.map((country) => (
              <option key={country.prmtk_countryid} value={country.prmtk_countryid}>
                {country.prmtk_name}
              </option>
            ))}
          </select>
          <InfoTip text="Select the country where your company is registered. This is your official business location for the registered address." />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            City <span className="text-red-600">*</span>
          </label>
          {citiesError && (
            <p className="text-xs text-red-600 mb-2 bg-red-50 p-2 rounded">{citiesError}</p>
          )}
          <select
            value={formData.city}
            onChange={(e) => {
              handleUpdateFormData({
                city: e.target.value,
                cityName: e.target.options[e.target.selectedIndex].text,
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={!formData.country || isLoadingCities}
          >
            <option value="">
              {!formData.country
                ? "Select Country First"
                : isLoadingCities
                  ? "Loading cities..."
                  : "Select City..."}
            </option>
            {cities.map((city) => (
              <option key={city.prmtk_cityid} value={city.prmtk_cityid}>
                {city.prmtk_name}
              </option>
            ))}
          </select>
          <InfoTip text="Select the city where your business is located. Our team may conduct a site visit to verify your registered address." />
        </div>
      </div>

      {/* Company Website */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          Do you have a company website? <span className="text-red-600">*</span>
        </label>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="radio"
              id="website-no"
              name="website"
              value="no"
              checked={formData.website === "no"}
              onChange={(e) => handleUpdateFormData({ website: e.target.value })}
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
              onChange={(e) => handleUpdateFormData({ website: e.target.value })}
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
            onChange={(e) => handleUpdateFormData({ websiteUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-3"
            placeholder="https://example.com"
          />
        )}
        <InfoTip text="Having a professional website demonstrates your business credibility and online presence. If you have one, please provide the URL." />
      </div>

      {/* SME or Locally Owned Emirati Company */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          Are you an SME or locally owned Emirati company? <span className="text-red-600">*</span>
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
                onChange={() => handleUpdateFormData({ isEmiratiSME: option.value })}
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        <InfoTip text="SMEs (Small and Medium Enterprises) and locally owned Emirati companies may qualify for special benefits and support programs. Select 'Yes' if your company meets these criteria." />
      </div>

      {/* Khalifa Fund Registration */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          Are you an SME registered with Khalifa Fund in the SME Champion Portal? <span className="text-red-600">*</span>
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
                onChange={() => handleUpdateFormData({ isKhalifaFundRegistered: option.value })}
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
        <InfoTip text="The Khalifa Fund supports Emirati entrepreneurs and SMEs. Registration in the SME Champion portal demonstrates your commitment to professional development and access to funding opportunities." />
      </div>

      {/* ICV Certificate */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          Do you have an ICV Certificate? <span className="text-red-600">*</span>
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
                onChange={() => handleUpdateFormData({ hasICVCertificate: option.value })}
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
            onChange={(e) => handleUpdateFormData({ icvScore: e.target.value })}
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
        <InfoTip text="ICV (In-Country Value) certification demonstrates your company's commitment to utilizing local resources and contributing to the UAE economy. It significantly improves your chances in government tenders." />
      </div>
    </div>
  );
}
