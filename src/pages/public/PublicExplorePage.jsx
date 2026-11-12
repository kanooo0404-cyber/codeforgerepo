import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo.jsx';
import { DemoModeBanner } from '../../components/DemoModeBanner.jsx';
import { ExploreView } from '../../components/ExploreView.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function PublicExplorePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#303BFA] flex flex-col">
      <DemoModeBanner />

      <header className="w-full px-4 sm:px-8 pt-5 pb-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <BrandLogo to="/" />
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="px-4 py-2 rounded-full text-sm font-medium text-white/85 hover:text-white hover:bg-white/10"
            >
              Home
            </Link>
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#11183B] text-xs font-semibold hover:bg-[#DDE2FF]"
              >
                Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#11183B] text-xs font-semibold hover:bg-[#DDE2FF]"
              >
                Sign In
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-10">
        <div className="px-2 overflow-hidden select-none pointer-events-none">
          <div className="font-display font-extrabold uppercase tracking-tight text-[#F3F6F2] text-[clamp(2.8rem,8.5vw,7.4rem)] leading-[0.82] -mb-4">
            FOUND IT
          </div>
        </div>

        <div className="relative z-10 bg-[#F3F6F2] rounded-[28px] shadow-panel p-6 sm:p-8">
          <ExploreView isPublic />
        </div>
      </div>
    </div>
  );
}
