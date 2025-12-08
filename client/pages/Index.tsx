import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UIWireframeMockup, DecorativeWaves } from "@/components/DecorativeElements";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Add actual login logic here
    setTimeout(() => {
      setIsLoading(false);
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
            {/* Background graphic */}
            <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
              <svg
                className="w-96 h-96"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="200" cy="200" r="180" fill="#E8C4A0" opacity="0.3" />
              </svg>
            </div>

            {/* Login Card */}
            <div className="bg-navy rounded-lg p-8 w-full max-w-sm relative z-10 shadow-lg">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-cyan"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-cyan"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-light-cyan text-navy font-semibold rounded hover:bg-light-cyan/90 transition disabled:opacity-50"
                >
                  {isLoading ? "LOGGING IN..." : "LOGIN"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button className="text-light-cyan text-sm font-semibold hover:text-light-cyan/80 transition">
                  REGISTER NOW
                </button>
              </div>
            </div>

            {/* Decorative illustration */}
            <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none">
              <UIWireframeMockup />
            </div>

            {/* Wavy decorative elements */}
            <div className="absolute left-0 bottom-20 w-full opacity-40 pointer-events-none">
              <DecorativeWaves />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
