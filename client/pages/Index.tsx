import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clipboard, DecorativeWaveLines } from "@/components/DecorativeElements";

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
    <div className="flex flex-col min-h-screen bg-white" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      {/* Main content */}
      <main className="flex-grow flex flex-col">
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
          {/* Left section - Welcome */}
          <div className={`bg-white px-8 sm:px-12 py-16 lg:py-24 flex flex-col justify-center relative z-10 ${isArabic ? "text-right" : "text-left"}`}>
            <div className="max-w-md">
              <h1 className="text-5xl sm:text-6xl font-bold text-navy mb-6 leading-tight">
                {t("index.welcome")}<br />
                {t("index.vendorHub")}
              </h1>
              <p className="text-base text-gray-700 mb-16 leading-relaxed">
                {t("index.subtitle")}
              </p>

              {/* Decorative curved element */}
              <div className="opacity-40 mt-8">
                <svg
                  className="w-56 h-28"
                  viewBox="0 0 280 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 0 100 Q 70 50, 140 70 T 280 90"
                    stroke="#B0B0B0"
                    strokeWidth="14"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Curved divider between sections */}
          <svg
            className="absolute left-0 top-0 h-full hidden lg:block"
            style={{ width: "60px" }}
            preserveAspectRatio="none"
            viewBox="0 0 100 1000"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 0 Q 30 500, 0 1000"
              stroke="none"
              fill="none"
            />
            <path
              d="M 100 0 Q 40 500, 100 1000"
              stroke="none"
              fill="none"
            />
          </svg>

          {/* Right section - Login form and graphics */}
          <div className="bg-gradient-to-br from-orange-300 via-orange-200 to-orange-300 px-8 sm:px-12 py-16 lg:py-24 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Curved organic shape at top */}
            <svg
              className="absolute top-0 right-0 w-full h-40 pointer-events-none"
              preserveAspectRatio="xMidYMid slice"
              viewBox="0 0 1200 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 0 100 Q 200 20, 400 80 T 800 60 T 1200 120 L 1200 0 L 0 0 Z"
                fill="#D89F6F"
                opacity="0.3"
              />
              <path
                d="M 0 140 Q 300 60, 600 140 T 1200 100 L 1200 300 L 0 300 Z"
                fill="none"
              />
            </svg>

            {/* Decorative clipboard illustration */}
            <div className="absolute top-12 right-12 w-96 h-96 pointer-events-none hidden lg:flex items-center justify-center">
              <Clipboard />
            </div>

            {/* Wavy decorative elements at bottom */}
            <div className="absolute left-0 bottom-0 w-full pointer-events-none">
              <DecorativeWaveLines />
            </div>

            {/* Login Card */}
            <div className="bg-navy rounded-xl p-8 w-full max-w-sm relative z-20 shadow-2xl">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <input
                    type="email"
                    placeholder={t("index.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full px-5 py-3 bg-white border border-gray-200 rounded-lg text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition duration-200 text-sm ${isArabic ? "text-right" : "text-left"}`}
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder={t("index.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full px-5 py-3 bg-white border border-gray-200 rounded-lg text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition duration-200 text-sm ${isArabic ? "text-right" : "text-left"}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-5 py-3 bg-cyan-300 text-navy font-bold rounded-lg hover:bg-cyan-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wide"
                >
                  {isLoading ? (isArabic ? "جاري الدخول..." : "LOGGING IN...") : t("index.loginBtn")}
                </button>
              </form>

              <div className={`mt-8 ${isArabic ? "text-right" : "text-center"} border-t border-navy/20 pt-6`}>
                <p className="text-cyan-100 text-xs mb-3">{t("index.registerText")}</p>
                <a href="#" className="text-cyan-300 text-sm font-semibold hover:text-cyan-200 transition duration-200 inline-block">
                  {t("index.register")}
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
