import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UIWireframeMockup, DecorativeWaves } from "@/components/DecorativeElements";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login request
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard after successful login
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Main content */}
      <main className="flex-grow flex flex-col">
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2">
          {/* Left section - Welcome */}
          <div className="bg-white px-6 sm:px-8 lg:px-12 py-12 lg:py-20 flex flex-col justify-center">
            <div className="max-w-md">
              <h1 className="text-4xl sm:text-5xl font-bold text-navy mb-4">
                Welcome to<br />
                ECA Vendor Hub
              </h1>
              <p className="text-lg text-gray-700 mb-12">
                Please Login to access the requests
              </p>

              {/* Decorative element */}
              <div className="opacity-30">
                <svg
                  className="w-48 h-20"
                  viewBox="0 0 300 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 20 80 Q 80 40, 140 60 T 260 75"
                    stroke="#C0C0C0"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right section - Login form and graphics */}
          <div className="bg-gradient-to-b from-warm-tan to-warm-tan px-6 sm:px-8 lg:px-12 py-12 lg:py-20 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Decorative illustration - Clipboard and hand */}
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-72 h-80 pointer-events-none hidden lg:block">
              <UIWireframeMockup />
            </div>

            {/* Wavy decorative elements */}
            <div className="absolute left-0 bottom-0 w-full opacity-50 pointer-events-none">
              <DecorativeWaves />
            </div>

            {/* Login Card */}
            <div className="bg-navy rounded-lg p-8 w-full max-w-sm relative z-20 shadow-xl">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-cyan focus:border-transparent transition"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-cyan focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-light-cyan text-navy font-bold rounded hover:bg-light-cyan/85 transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isLoading ? "LOGGING IN..." : "LOGIN"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <a href="#" className="text-light-cyan text-sm font-semibold hover:text-light-cyan/80 transition inline-block">
                  REGISTER NOW
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
