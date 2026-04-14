'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, guestLogin, googleLogin, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.name, formData.email, formData.password, formData.phone);
    }

    setLoading(false);
    if (result.success) {
      router.push('/');
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    const result = await guestLogin();
    setLoading(false);
    if (result.success) {
      router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    // Since we can't do real OAuth without Google Cloud setup,
    // we'll simulate Google login with a prefilled form
    setLoading(true);
    const result = await googleLogin(
      'Google User',
      `user${Date.now()}@gmail.com`,
      'https://lh3.googleusercontent.com/a/default-user=s96-c'
    );
    setLoading(false);
    if (result.success) {
      router.push('/');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f1f3f6] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[750px] bg-white rounded shadow-lg flex overflow-hidden min-h-[528px]">
        {/* Left Panel - Blue */}
        <div className="hidden md:flex w-[40%] bg-[#2874f0] p-8 flex-col justify-between">
          <div>
            <h2 className="text-white text-[28px] font-bold mb-4">
              {isLogin ? 'Login' : 'Looks like you\'re new here!'}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              {isLogin
                ? 'Get access to your Orders, Wishlist and Recommendations'
                : 'Sign up with your email to get started'
              }
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="50" y="40" width="100" height="80" rx="8" fill="rgba(255,255,255,0.15)"/>
              <rect x="65" y="55" width="70" height="10" rx="5" fill="rgba(255,255,255,0.25)"/>
              <rect x="65" y="75" width="70" height="10" rx="5" fill="rgba(255,255,255,0.25)"/>
              <rect x="80" y="95" width="40" height="14" rx="4" fill="#fb641b"/>
              <circle cx="100" cy="25" r="15" fill="rgba(255,255,255,0.2)"/>
              <path d="M95 25 l5 5 l10-10" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (signup only) */}
            {!isLogin && (
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-[#2874f0] outline-none text-sm transition-colors"
                  id="signup-name"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                required
                className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-[#2874f0] outline-none text-sm transition-colors"
                id="login-email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 border-b-2 border-gray-200 focus:border-[#2874f0] outline-none text-sm transition-colors"
                id="login-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Phone (signup only) */}
            {!isLogin && (
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Mobile Number (optional)"
                  className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-[#2874f0] outline-none text-sm transition-colors"
                  id="signup-phone"
                />
              </div>
            )}

            {/* Terms */}
            <p className="text-[11px] text-gray-500 leading-4">
              By continuing, you agree to Flipkart&apos;s{' '}
              <span className="text-[#2874f0] cursor-pointer">Terms of Use</span> and{' '}
              <span className="text-[#2874f0] cursor-pointer">Privacy Policy</span>.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fb641b] text-white py-3 rounded-sm text-sm font-semibold hover:bg-[#e85d19] transition-colors disabled:opacity-60 shadow-sm"
              id="login-submit-btn"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <span className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              id="google-login-btn"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            {/* Guest Login */}
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full py-3 rounded-sm text-sm font-semibold text-[#2874f0] hover:bg-blue-50 transition-colors disabled:opacity-60 border border-[#2874f0]"
              id="guest-login-btn"
            >
              Continue as Guest
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <button
            className="w-full text-center mt-6 text-sm font-semibold text-[#2874f0] hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ name: '', email: '', password: '', phone: '' });
            }}
          >
            {isLogin ? 'New to Flipkart? Create an account' : 'Existing User? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
