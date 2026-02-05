import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  title: string;
}

interface FormProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
}

export default function FormProgressBar({
  currentStep,
  totalSteps,
  steps,
}: FormProgressBarProps) {
  return (
    <div className="bg-gray-50 p-6">
      {/* Progress Bar Visual */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm flex-shrink-0 transition ${
                index < currentStep
                  ? "bg-green-500 text-white"
                  : index === currentStep
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {index < currentStep ? <Check size={20} /> : index + 1}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition ${
                  index < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        {steps.map((step) => (
          <div key={step.id} className="text-center flex-1">
            <p className="truncate">{step.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Text */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          Progress: <span className="font-semibold">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </p>
      </div>
    </div>
  );
}
