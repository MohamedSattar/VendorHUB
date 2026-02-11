import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Check } from "lucide-react";

interface CRMEnvironment {
  name: string;
  label: string;
  dataverseResource: string;
  description: string;
}

interface EnvironmentResponse {
  current: CRMEnvironment;
  available: CRMEnvironment[];
}

export default function CRMEnvironmentSwitcher() {
  const { toast } = useToast();
  const [currentEnv, setCurrentEnv] = useState<CRMEnvironment | null>(null);
  const [availableEnvs, setAvailableEnvs] = useState<CRMEnvironment[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch current environment on mount
  useEffect(() => {
    const fetchEnvironment = async () => {
      try {
        const response = await fetch("/api/config/crm-environment");
        if (response.ok) {
          const data: EnvironmentResponse = await response.json();
          setCurrentEnv(data.current);
          setAvailableEnvs(data.available);
        }
      } catch (error) {
        console.error("Failed to fetch CRM environment:", error);
      }
    };

    fetchEnvironment();
  }, []);

  const handleSwitchEnvironment = async (environmentName: string) => {
    if (environmentName === currentEnv?.name) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      const response = await fetch("/api/config/crm-environment/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ environment: environmentName }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch environment");
      }

      const data: EnvironmentResponse = await response.json();
      setCurrentEnv(data.current);
      setAvailableEnvs(data.available);

      toast({
        title: "Success",
        description: `Switched to ${data.current.label}`,
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error switching environment:", error);
      toast({
        title: "Error",
        description: "Failed to switch CRM environment",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  if (!currentEnv) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        title="Switch CRM Environment"
      >
        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
        <span className="font-medium text-gray-700">{currentEnv.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-80">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-1">CRM Environment</h3>
            <p className="text-sm text-gray-600">Switch between different CRM instances</p>
          </div>

          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {availableEnvs.map((env) => (
              <button
                key={env.name}
                onClick={() => handleSwitchEnvironment(env.name)}
                disabled={isSwitching}
                className={`w-full text-left p-3 rounded-lg transition ${
                  currentEnv.name === env.name
                    ? "bg-blue-50 border-2 border-blue-300"
                    : "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                } ${isSwitching ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      {env.label}
                      {currentEnv.name === env.name && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{env.description}</p>
                    <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                      {env.dataverseResource}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
