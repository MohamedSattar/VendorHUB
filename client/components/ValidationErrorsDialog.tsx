import { AlertCircle, ChevronRight, X } from "lucide-react";
import {
  ValidationError,
  groupErrorsByStep,
  getStepName,
} from "@/utils/formValidation";

interface ValidationErrorsDialogProps {
  isOpen: boolean;
  errors: ValidationError[];
  onClose: () => void;
  onGoToStep: (stepIndex: number) => void;
}

export default function ValidationErrorsDialog({
  isOpen,
  errors,
  onClose,
  onGoToStep,
}: ValidationErrorsDialogProps) {
  if (!isOpen || errors.length === 0) return null;

  const groupedErrors = groupErrorsByStep(errors);
  const stepIndices = Object.keys(groupedErrors)
    .map((s) => parseInt(s))
    .sort((a, b) => a - b);

  // Normalize field names for display
  const normalizeFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b(of|and)\b/g, (m) => m.toLowerCase()) // Lowercase certain words
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-xl font-bold text-red-900">
                Form Validation Issues
              </h2>
              <p className="text-sm text-red-700 mt-1">
                {errors.length} error(s) found. Please fix them before
                submitting.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-100 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {stepIndices.map((stepIndex) => {
            const stepErrors = groupedErrors[stepIndex] || [];
            const stepName = getStepName(stepIndex);

            return (
              <div key={stepIndex} className="border border-red-200 rounded-lg overflow-hidden">
                {/* Step Header */}
                <div className="bg-red-100 px-4 py-3 flex items-center justify-between hover:bg-red-150 transition cursor-pointer"
                  onClick={() => onGoToStep(stepIndex)}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                      {stepIndex + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-red-900">{stepName}</p>
                      <p className="text-xs text-red-700">
                        {stepErrors.length} error(s)
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-600" />
                </div>

                {/* Errors List */}
                <div className="bg-white divide-y divide-red-100">
                  {stepErrors.map((error, errorIndex) => (
                    <div key={errorIndex} className="px-4 py-3 text-sm">
                      <div className="flex gap-3">
                        <span className="text-red-600 font-bold mt-0.5 flex-shrink-0">
                          •
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-red-900">
                            {normalizeFieldName(error.field)}
                          </p>
                          <p className="text-red-700 text-xs mt-1">
                            {error.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Close
          </button>
          <button
            onClick={() => {
              onGoToStep(stepIndices[0]);
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            Go to First Error (Step {stepIndices[0] + 1})
          </button>
        </div>
      </div>
    </div>
  );
}
