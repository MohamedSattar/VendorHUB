import { useEffect, useState } from "react";

export default function DebugAPI() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching from /api/odata/engagements...");
        const response = await fetch("/api/odata/engagements");
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log("API Response:", jsonData);
        setData(jsonData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">API Debug Page</h1>
      
      {loading && <p className="text-blue-600">Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      
      {data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API Response Structure</h2>
          
          {data.value && (
            <div>
              <p className="mb-4"><strong>Total Items:</strong> {data.value.length}</p>
              
              {data.value.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">First Item Sample:</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    {JSON.stringify(data.value[0], null, 2)}
                  </pre>
                  
                  <h3 className="text-lg font-semibold mt-6 mb-3">All Fields Available:</h3>
                  <ul className="list-disc pl-6">
                    {data.value[0] && Object.keys(data.value[0]).map((key) => (
                      <li key={key} className="font-mono text-sm">
                        {key}: <span className="text-gray-600">{typeof data.value[0][key]}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-semibold mt-6 mb-3">All Items:</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    {JSON.stringify(data.value, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
