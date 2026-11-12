import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, KeyRound, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo.jsx';
import { DemoModeBanner } from '../../components/DemoModeBanner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function LoginPage() {
  const { login, demoLogin, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectUser = (loggedInUser) => {
    const requestedRedirect = searchParams.get('redirect');
    if (loggedInUser.role === 'admin') {
      navigate(
        requestedRedirect?.startsWith('/admin') ? requestedRedirect : '/admin/dashboard',
        { replace: true }
      );
      return;
    }
    navigate(
      requestedRedirect?.startsWith('/student') ? requestedRedirect : '/student/dashboard',
      { replace: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const signedIn = await login({ email, password });
      showToast(`Welcome back, ${signedIn.name}!`);
      redirectUser(signedIn);
    } catch (err) {
      setError(err.message || 'Sign in failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccount = async (uid) => {
    setError('');
    setLoading(true);
    try {
      const signedIn = await demoLogin(uid);
      showToast(`Signed in to Local Demo Mode as ${signedIn.name}`);
      redirectUser(signedIn);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#303BFA] flex flex-col">
      <DemoModeBanner />

      <header className="px-4 sm:px-8 pt-5 pb-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <BrandLogo to="/" />
          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="text-sm font-medium text-white/85 hover:text-white"
            >
              Public Explore
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full bg-white text-[#11183B] text-xs font-semibold hover:bg-[#DDE2FF]"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="overflow-hidden select-none pointer-events-none text-center">
            <div className="font-display font-extrabold uppercase tracking-tight text-[#F3F6F2] text-5xl sm:text-6xl leading-[0.82] -mb-2.5">
              FOUND IT
            </div>
          </div>

          <div className="relative z-10 bg-[#F3F6F2] rounded-[28px] p-6 sm:p-8 shadow-panel space-y-6">
            <div>
              <h1 className="font-heading font-bold text-2xl text-[#11183B]">
                Sign in to FoundIt
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Access your student portal or authorized Campus Security dashboard.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl p-3.5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                  Campus Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-pill transition disabled:opacity-60"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {isDemoMode && (
              <div className="bg-white rounded-2xl p-4 border border-[#DDE2FF] space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#303BFA]">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Local Demo Mode — Quick Sign-In</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Firebase env vars are unconfigured. Test any role instantly:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoAccount('student_aryan')}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F3F6F2] hover:bg-[#DDE2FF] text-xs font-semibold text-[#11183B] transition"
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#303BFA]" />
                      Aryan Sharma (Student — Lost Owner)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoAccount('student_kunal')}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F3F6F2] hover:bg-[#DDE2FF] text-xs font-semibold text-[#11183B] transition"
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#303BFA]" />
                      Kunal Verma (Student — Finder)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoAccount('admin_security')}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#11183B] hover:bg-[#303BFA] text-xs font-semibold text-white transition"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#DDE2FF]" />
                      Security Admin (Campus Security Portal)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-slate-600">
              New student on campus?{' '}
              <Link to="/register" className="font-semibold text-[#303BFA] hover:underline">
                Create a student account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
