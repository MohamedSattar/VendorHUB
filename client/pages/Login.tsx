import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, Building2, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import ECALogo from "@/components/ECALogo";
import Footer from "@/components/Footer";
import {
  loginWithEmailPassword,
  registerUser,
  verifyInvitation,
  type RegistrationData,
  type InvitationInfo,
} from "@/services/auth";

type Mode = "login" | "register" | "invitation";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isArabic } = useLanguage();
  const [searchParams] = useSearchParams();

  // Mode state
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration form state
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  // Invitation state
  const [invitationCode, setInvitationCode] = useState("");
  const [invitationData, setInvitationData] = useState<InvitationInfo | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  // Check for invitation in URL
  useEffect(() => {
    const code = searchParams.get("invitation");
    if (code) {
      setInvitationCode(code);
      setMode("invitation");
      verifyInvitationCode(code);
    }
  }, [searchParams]);

  const verifyInvitationCode = async (code: string) => {
    try {
      setIsLoading(true);
      const data = await verifyInvitation(code);
      setInvitationData(data);
      setRegEmail(data.email);
      setOrganizationName(data.organizationName);
      setInvitationError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid invitation";
      setInvitationError(errorMessage);
      setInvitationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await loginWithEmailPassword({
        email: loginEmail,
        password: loginPassword,
      });

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !regEmail.trim() ||
      !regPassword.trim() ||
      !organizationName.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (regPassword.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const registrationData: RegistrationData = {
        email: regEmail,
        password: regPassword,
        firstName,
        lastName,
        organizationName,
        invitationCode: invitationCode || undefined,
      };

      const response = await registerUser(registrationData);

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 ${isArabic ? "rtl" : "ltr"}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div onClick={() => navigate("/")} className="cursor-pointer flex-shrink-0">
              <ECALogo />
            </div>
            <div className="text-sm text-gray-600">
              {mode === "login" ? "Sign In to Your Account" : "Create Your Account"}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Tab */}
          {mode === "login" && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-navy mb-2">Welcome Back</h2>
                <p className="text-gray-600 text-sm">
                  Sign in to access your account
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    {showPassword ? (
                      <EyeOff className="absolute left-3 top-3 w-5 h-5 text-gray-400 cursor-pointer" onClick={() => setShowPassword(false)} />
                    ) : (
                      <Eye className="absolute left-3 top-3 w-5 h-5 text-gray-400 cursor-pointer" onClick={() => setShowPassword(true)} />
                    )}
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-navy text-white font-medium py-2 rounded-lg hover:bg-navy/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Switch to Register */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      setInvitationCode("");
                      setInvitationData(null);
                    }}
                    className="text-navy font-semibold hover:underline"
                  >
                    Create one here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Registration Tab */}
          {mode === "register" && !invitationCode && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-navy mb-2">Create Account</h2>
                <p className="text-gray-600 text-sm">
                  Join us to get started
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent text-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Your Company"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Min 8 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Switch to Login */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-navy font-semibold hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Invitation Registration Tab */}
          {mode === "invitation" && invitationData && !invitationError && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-navy mb-2">Complete Your Registration</h2>
                <p className="text-gray-600 text-sm">
                  You've been invited to join us
                </p>
              </div>

              {/* Invitation Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Organization:</span> {invitationData.organizationName}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <span className="font-medium">Invited by:</span> {invitationData.invitedBy}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Invitation expires: {new Date(invitationData.expiresAt).toLocaleDateString()}
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent text-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email (Pre-filled and disabled) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={regEmail}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Min 8 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? "Completing Registration..." : "Complete Registration"}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

          {/* Invitation Error */}
          {mode === "invitation" && invitationError && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-navy mb-2">Invalid Invitation</h2>
                <p className="text-gray-600 text-sm mb-6">
                  {invitationError}
                </p>
              </div>

              <button
                onClick={() => {
                  setMode("register");
                  setInvitationCode("");
                  setInvitationData(null);
                  setInvitationError(null);
                }}
                className="w-full bg-navy text-white font-medium py-2 rounded-lg hover:bg-navy/90 transition"
              >
                Create Account Instead
              </button>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-navy font-semibold hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
