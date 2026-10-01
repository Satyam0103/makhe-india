import React, { useState, useEffect } from 'react';
import { Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { adminLoginApi, isAdminAuthenticated } from '../../services/adminAuthService';
import { PageRoute } from '../../types';

interface AdminLoginProps {
  onNavigate: (route: PageRoute) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect directly to /admin
  useEffect(() => {
    if (isAdminAuthenticated()) {
      onNavigate('/admin');
    }
  }, [onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your admin email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your admin password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await adminLoginApi(email.trim(), password);

      if (res.success) {
        setSuccessMsg('Authentication successful. Redirecting to dashboard...');
        setTimeout(() => {
          onNavigate('/admin');
        }, 500);
      } else {
        setErrorMsg(res.message || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err: any) {
      setErrorMsg('Unable to connect to the server. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#142B1A] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#142B1A] selection:text-[#FAF7F2]">
      {/* Background Ambience Pattern */}
      <div className="w-full max-w-md">
        
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#142B1A] text-[#E5C778] shadow-md mb-4">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A] tracking-tight">
            Makhé India
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#8C6D1F] font-bold mt-1">
            Back-Office Operations &amp; Admin
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#FAF7F2] border border-[#DDD1BE] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#142B1A] font-sans-brand">
              Sign In to Admin Portal
            </h2>
            <p className="text-xs text-[#596E5F] mt-1">
              Authorized personnel only. Sessions are encrypted and protected by JWT.
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] flex items-center gap-2.5 text-xs font-medium">
              <CheckCircle2 size={16} className="shrink-0 text-[#2E7D32]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FDEDEC] border border-[#F5B7B1] text-[#922B21] flex items-start gap-2.5 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 text-[#C0392B] mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-1.5 font-sans-brand"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B8F80]">
                  <Mail size={16} />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="admin@makheindia.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9CBB3] bg-white text-sm text-[#142B1A] font-sans-brand placeholder:text-[#A3B3A6] focus:outline-none focus:border-[#142B1A] focus:ring-1 focus:ring-[#142B1A] transition-colors disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-1.5 font-sans-brand"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B8F80]">
                  <Lock size={16} />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9CBB3] bg-white text-sm text-[#142B1A] font-sans-brand placeholder:text-[#A3B3A6] focus:outline-none focus:border-[#142B1A] focus:ring-1 focus:ring-[#142B1A] transition-colors disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D9CBB3] text-[#142B1A] focus:ring-[#142B1A] accent-[#142B1A]"
                />
                <span className="text-xs text-[#596E5F] font-medium font-sans-brand">
                  Keep me signed in
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#142B1A] text-[#FAF7F2] hover:bg-[#234A30] active:scale-[0.99] font-bold text-xs uppercase tracking-wider font-sans-brand transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#E5C778]" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>LOGIN TO DASHBOARD</span>
                    <ArrowRight size={16} className="text-[#E5C778]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Footer Note */}
        <div className="mt-8 text-center text-[11px] text-[#7B8F80] space-y-1">
          <p>© {new Date().getFullYear()} Makhé India · Operations &amp; Fulfillment</p>
          <p className="text-[10px]">Hostinger Production Deployment Ready · Encrypted JWT</p>
        </div>
      </div>
    </div>
  );
};
