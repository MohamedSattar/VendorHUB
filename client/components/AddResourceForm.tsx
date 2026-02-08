import { Upload } from "lucide-react";

export default function AddResourceForm() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Candidate Details Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-navy mb-6">Candidate Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+971 50 000 0000"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Personal Photo and UAE Resident */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Photo */}
          <div>
            <label className="block text-sm font-medium text-navy mb-3">
              Personal Photo
            </label>
            <div className="flex flex-col gap-3">
              <div className="w-full h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-100 transition">
                  Upload
                </button>
                <button className="flex-1 px-3 py-2 border border-red-300 text-red-700 rounded text-sm hover:bg-red-50 transition">
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* UAE Resident Toggle */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-navy mb-4">
              UAE Resident
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
