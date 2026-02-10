import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clipboard, DecorativeWaveLines } from "@/components/DecorativeElements";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

type AuthMode = "signin" | "redeem" | "forgot-password";

export default function Index() {
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();

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

  const handleRedeemInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitationCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an invitation code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Navigate to invitation page with the code
    navigate(`/invitation?invitation=${encodeURIComponent(invitationCode)}`);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      // Call forgot password API
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      toast({
        title: "Success",
        description: "Password reset link sent to your email",
      });

      setResetEmailSent(true);
      setTimeout(() => {
        setAuthMode("signin");
        setResetEmailSent(false);
        setForgotPasswordEmail("");
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white" dir={language === "ar" ? "rtl" : "ltr"}>
      <Header />

      {/* Main content */}
      <main className="flex-grow flex flex-col">
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
          {/* Left section - Welcome */}
          <div className={`bg-white px-8 sm:px-12 py-16 lg:py-24 flex flex-col justify-center relative z-10 ${language === "ar" ? "text-right" : "text-left"}`}>
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
              {/* Tabs */}
              <div className="flex gap-6 mb-8 border-b border-gray-600">
                <button
                  onClick={() => {
                    setAuthMode("signin");
                    setInvitationCode("");
                  }}
                  className={`pb-3 font-semibold transition ${
                    authMode === "signin"
                      ? "text-cyan-300 border-b-2 border-cyan-300"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => {
                    setAuthMode("redeem");
                    setEmail("");
                    setPassword("");
                  }}
                  className={`pb-3 font-semibold transition ${
                    authMode === "redeem"
                      ? "text-cyan-300 border-b-2 border-cyan-300"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Redeem invitation
                </button>
              </div>

              {/* Sign in Form */}
              {authMode === "signin" && (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <input
                      type="email"
                      placeholder={t("index.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full px-5 py-3 bg-white border border-gray-200 rounded-lg text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition duration-200 text-sm ${language === "ar" ? "text-right" : ""}`}
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder={t("index.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`w-full px-5 py-3 bg-white border border-gray-200 rounded-lg text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition duration-200 text-sm ${language === "ar" ? "text-right" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot-password");
                        setEmail("");
                        setPassword("");
                      }}
                      className="text-cyan-300 text-xs mt-2 hover:text-cyan-200 transition"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-5 py-3 bg-cyan-300 text-navy font-bold rounded-lg hover:bg-cyan-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wide"
                  >
                    {isLoading ? (language === "ar" ? "جاري الدخول..." : "LOGGING IN...") : t("index.loginBtn")}
                  </button>
                </form>
              )}

              {/* Redeem Invitation Form */}
              {authMode === "redeem" && (
                <form onSubmit={handleRedeemInvitation} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-cyan-100 mb-2">
                      * Invitation code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your invitation code"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      required
                      className={`w-full px-5 py-3 bg-white border border-gray-200 rounded-lg text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition duration-200 text-sm ${language === "ar" ? "text-right" : ""}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-5 py-3 bg-cyan-300 text-navy font-bold rounded-lg hover:bg-cyan-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wide"
                  >
                    {isLoading ? "Processing..." : "Register"}
                  </button>
                </form>
              )}

              {/* Forgot Password Form */}
              {authMode === "forgot-password" && (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  {resetEmailSent ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-green-700 font-medium mb-2">Check your email</p>
                      <p className="text-green-600 text-sm">
                        We've sent a password reset link to {forgotPasswordEmail}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-cyan-100 mb-2">
                          Email address
                        </label>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          required
                          className={`w-full px-5 py-3 bg-white border border-gray-200 rounded-lg text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition duration-200 text-sm ${language === "ar" ? "text-right" : ""}`}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-5 py-3 bg-cyan-300 text-navy font-bold rounded-lg hover:bg-cyan-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wide"
                      >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setResetEmailSent(false);
                      setForgotPasswordEmail("");
                    }}
                    className="w-full text-cyan-300 text-sm font-medium hover:text-cyan-200 transition"
                  >
                    Back to Sign in
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
