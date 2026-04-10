import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/users/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Check credentials.');
      }

      localStorage.setItem('adminToken', data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-[-10%] right-[-5%]  w-[45vw] h-[45vw] bg-rose-600/10   rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-blue-700/8    rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3      w-[30vw] h-[30vw] bg-purple-700/5  rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-white/5 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-8 sm:p-10">

          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-700 to-rose-500 flex items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.4)] border border-rose-500/30 mb-5">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Superadmin Access</h1>
            <p className="text-gray-500 text-sm mt-1.5 text-center">Restricted area — authorised personnel only.</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@skillup.com"
                  autoComplete="email"
                  className="w-full bg-[#0a0f1e] border border-white/10 text-white text-sm font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-rose-500/50 transition-colors placeholder-gray-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#0a0f1e] border border-white/10 text-white text-sm font-medium rounded-xl pl-11 pr-12 py-3.5 focus:outline-none focus:border-rose-500/50 transition-colors placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-500 text-white font-bold text-sm tracking-wide hover:from-rose-600 hover:to-rose-400 transition-all shadow-[0_4px_20px_rgba(244,63,94,0.35)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-xs text-gray-600 mt-8">
            Not an admin?{' '}
            <a href="/login" className="text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2">
              Go to learner login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
