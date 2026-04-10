import React, { useState } from 'react';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from '../../firebase/firebase';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../contexts/TranslationContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetRoute, setTargetRoute] = useState(null);
  
  const { tSync: t } = useTranslation();
  const { currentUser } = useAuth();
  
  const navigate = useNavigate();

  // Handle post-auth redirect explicitly watching global auth state to avoid protected route bounce
  React.useEffect(() => {
    if (currentUser && targetRoute) {
      navigate(targetRoute);
    } else if (currentUser && !targetRoute) {
      // Auto-redirect if already logged in but visits /login (e.g., page refresh)
      navigate('/dashboard');
    }
  }, [currentUser, targetRoute, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setMessage('Password reset email sent! Please check your inbox.');
        setLoading(false);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setTargetRoute('/dashboard');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setTargetRoute('/onboarding'); // Let the useEffect redirect safely
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth.*\)\./, ''));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f8f9fa] selection:bg-[#275df5] selection:text-white">
      {/* Premium Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#275df5]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#11a654]/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-slide-up z-10 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8 sm:p-10 relative">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#275df5] rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg shadow-[#275df5]/20 transform rotate-3 hover:rotate-6 transition-all duration-300">
            {isLogin && !isForgotPassword ? <LogIn className="text-white w-8 h-8"/> : <UserPlus className="text-white w-8 h-8"/>}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isForgotPassword ? t('Reset Password') : (isLogin ? t('Welcome Back') : t('Create Account'))}
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {isForgotPassword 
              ? t('Enter your email to receive recovery instructions.') 
              : t('Unlock your potential with Skill Up.')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 animate-fade-in text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border-l-4 border-[#275df5] text-[#275df5] flex items-start gap-3 animate-fade-in text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1.5 relative group">
            <label className="text-xs font-semibold text-gray-600 block uppercase tracking-wider">{t('Email Address')}</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#275df5] transition-colors" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-[#275df5] focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div className="space-y-1.5 relative group">
              <label className="text-xs font-semibold text-gray-600 block uppercase tracking-wider">{t('Password')}</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#275df5] transition-colors" />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-[#275df5] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {isLogin && !isForgotPassword && (
            <div className="flex justify-end mt-1">
              <button 
                type="button" 
                onClick={() => { setIsForgotPassword(true); setError(''); setMessage(''); }}
                className="text-sm font-semibold text-[#275df5] hover:text-[#1f4bc7] transition-colors focus:outline-none"
              >
                {t('Forgot password?')}
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 rounded-lg bg-[#275df5] text-white font-semibold hover:bg-[#1f4bc7] transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(39,93,245,0.39)] disabled:opacity-50 space-x-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
              <span>{isForgotPassword ? t('Send Reset Link') : (isLogin ? t('Sign In') : t('Create Free Account'))}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          {isForgotPassword ? (
            <button 
              onClick={() => { setIsForgotPassword(false); setError(''); setMessage(''); }} 
              className="text-[#275df5] hover:text-[#1f4bc7] transition-colors font-semibold"
            >
              {t('Back to Sign In')}
            </button>
          ) : (
            <p>
              {isLogin ? t("Don't have an account? ") : t("Already have an account? ")}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="text-[#275df5] hover:text-[#1f4bc7] transition-colors ml-1 font-semibold focus:outline-none"
              >
                {isLogin ? t('Sign up for free') : t('Sign in instead')}
              </button>
            </p>
          )}
        </div>

        {/* Admin portal link — separated by a divider so it never overlaps */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          <a
            href="/admin-login"
            className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors tracking-wide"
          >
            Superadmin Portal
          </a>
        </div>
      </div>
    </div>
  );
}

