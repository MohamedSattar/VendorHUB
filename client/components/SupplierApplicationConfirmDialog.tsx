import { AlertCircle, CheckCircle, X } from "lucide-react";
import { ValidationError } from "@/utils/formValidation";

interface SupplierApplicationConfirmDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  companyName: string;
  contactEmail: string;
  validationErrors: ValidationError[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SupplierApplicationConfirmDialog({
  isOpen,
  isLoading,
  companyName,
  contactEmail,
  validationErrors,
  onConfirm,
  onCancel,
}: SupplierApplicationConfirmDialogProps) {
  if (!isOpen) return null;

  const hasErrors = validationErrors.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {hasErrors ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
            <h2 className="text-xl font-bold text-navy">
              {hasErrors
                ? "Form Validation Issues"
                : "Confirm Application Submission"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {hasErrors ? (
            /* Validation Errors Display */
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-3">
                  Please fix the following issues before submitting:
                </h3>
                <ul className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <li
                      key={index}
                      className="text-sm text-red-800 flex items-start gap-2"
                    >
                      <span className="text-red-600 font-bold mt-0.5">•</span>
                      <span>
                        <strong>{error.field}:</strong> {error.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Confirmation Details */
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 text-sm mb-3">
                  Please review the following information before submitting your
                  application:
                </p>
              </div>

              {/* Company Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Company Name
                    </p>
                    <p className="text-sm text-navy font-medium mt-1">
                      {companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Contact Email
                    </p>
                    <p className="text-sm text-navy font-medium mt-1">
                      {contactEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">
                  Important Notice
                </h4>
                <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                  <li>
                    By submitting, you declare that all information provided is
                    true and complete
                  </li>
                  <li>
                    False or misleading information may result in disqualification
                  </li>
                  <li>
                    A confirmation email will be sent to {contactEmail}
                  </li>
                  <li>
                    You will receive a Tracking ID to monitor your application
                  </li>
                </ul>
              </div>

              {/* Confirmation Statement */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 italic">
                  "I hereby confirm that all information provided in this
                  questionnaire is true, complete, and accurate to the best of
                  my knowledge. I understand that any false or misleading
                  information may result in disqualification from the ECA Vendor
                  Program."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {hasErrors ? "Close" : "Cancel"}
          </button>

          {!hasErrors && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-8 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
