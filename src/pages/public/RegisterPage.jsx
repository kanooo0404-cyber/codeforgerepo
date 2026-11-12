import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, IdCard, Lock, Mail, Phone, User } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo.jsx';
import { DemoModeBanner } from '../../components/DemoModeBanner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const created = await register(form);
      showToast(`Account created! Welcome to FoundIt, ${created.name}.`);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to register account.');
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
              to="/login"
              className="px-4 py-2 rounded-full bg-white text-[#11183B] text-xs font-semibold hover:bg-[#DDE2FF]"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="overflow-hidden select-none pointer-events-none text-center">
            <div className="font-display font-extrabold uppercase tracking-tight text-[#F3F6F2] text-5xl sm:text-6xl leading-[0.82] -mb-2.5">
              FOUND IT
            </div>
          </div>

          <div className="relative z-10 bg-[#F3F6F2] rounded-[28px] p-6 sm:p-8 shadow-panel space-y-5">
            <div>
              <h1 className="font-heading font-bold text-2xl text-[#11183B]">
                Student Registration
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Create your verified student account to report items and use TrustLoop. Administrator accounts are provisioned exclusively by Campus Security.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl p-3.5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#11183B] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Priya Patel"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#11183B] mb-1">
                    Student ID
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.studentId}
                      onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                      placeholder="CS2025-104"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1">
                  Campus Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="priya@campus.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#11183B] mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="Computer Science"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#11183B] mb-1">
                    Phone (Private)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98..."
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1">
                  Password * (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-pill transition disabled:opacity-60"
              >
                <span>{loading ? 'Creating Account...' : 'Create Student Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-xs text-slate-600">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-[#303BFA] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
