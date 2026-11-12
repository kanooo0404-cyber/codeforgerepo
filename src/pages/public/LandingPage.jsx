import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  FileSearch,
  Handshake,
  Lock,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo.jsx';
import { DemoModeBanner } from '../../components/DemoModeBanner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { listReports } from '../../services/reportService.js';
import { listHydratedMatches } from '../../services/matchService.js';

export function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 12,
    matchesFound: 3,
    itemsRecovered: 2,
    activeZones: 9,
  });

  useEffect(() => {
    Promise.all([
      listReports({ includeClosed: true, viewer: null }),
      listHydratedMatches({ isAdmin: true }),
    ])
      .then(([reps, matches]) => {
        const returned = reps.filter((r) => r.status === 'RETURNED').length;
        const uniqueZones = new Set(reps.map((r) => r.location)).size;
        setStats({
          totalReports: reps.length,
          matchesFound: matches.length,
          itemsRecovered: returned,
          activeZones: Math.max(uniqueZones, 6),
        });
      })
      .catch(() => {});
  }, []);

  const reportLostTarget =
    user?.role === 'student' ? '/student/report-lost' : '/login?redirect=/student/report-lost';
  const reportFoundTarget =
    user?.role === 'student' ? '/student/report-found' : '/login?redirect=/student/report-found';
  const portalTarget =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'student'
        ? '/student/dashboard'
        : '/login';

  return (
    <div className="min-h-screen bg-[#303BFA] text-[#11183B] flex flex-col">
      <DemoModeBanner />

      {/* Header / Navbar */}
      <header className="w-full px-4 sm:px-8 pt-5 pb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <BrandLogo to="/" />

          <nav className="hidden md:flex items-center gap-1 bg-[#222CD4] p-1.5 rounded-full text-sm">
            <a
              href="#how-it-works"
              className="px-4 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 font-medium transition"
            >
              How It Works
            </a>
            <a
              href="#smartfind-ai"
              className="px-4 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 font-medium transition"
            >
              SmartFind AI
            </a>
            <a
              href="#trustloop"
              className="px-4 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 font-medium transition"
            >
              TrustLoop
            </a>
            <Link
              to="/explore"
              className="px-4 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 font-medium transition"
            >
              Explore Items
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                to={portalTarget}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#11183B] text-sm font-semibold hover:bg-[#DDE2FF] transition"
              >
                Open Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full bg-white text-[#11183B] text-sm font-semibold hover:bg-[#DDE2FF] transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 pt-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#DDE2FF]" />
              <span>AI-POWERED CAMPUS LOST &amp; FOUND PLATFORM</span>
            </div>

            <h1 className="font-display font-extrabold text-white text-4xl sm:text-6xl lg:text-[68px] leading-[1.02] tracking-tight uppercase">
              LOST SOMETHING? LET&apos;S FIND IT.
            </h1>

            <p className="text-white/85 text-base sm:text-lg max-w-2xl leading-relaxed">
              FoundIt centralizes scattered campus lost-and-found reports into one intelligent platform. SmartFind AI surfaces likely matches while TrustLoop and Campus Security guide safe, verified handovers.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to={reportLostTarget}
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-[#11183B] font-semibold text-sm sm:text-base hover:bg-[#DDE2FF] transition shadow-lg"
              >
                <Search className="w-4 h-4 text-[#303BFA]" />
                <span>Report Lost Item</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={reportFoundTarget}
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#222CD4] border border-white/25 text-white font-semibold text-sm sm:text-base hover:bg-white/15 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Found Item</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-white/90 hover:text-white text-sm font-medium"
              >
                <Compass className="w-4 h-4" />
                <span>Browse Public Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Iconic Watermark + Main Ivory Surface */}
      <div className="flex-1 px-4 sm:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-hidden select-none pointer-events-none px-2">
            <div className="font-display font-extrabold uppercase tracking-tight text-[#F3F6F2] text-[clamp(3.4rem,10vw,9rem)] leading-[0.82] -mb-4 sm:-mb-6">
              FOUND IT
            </div>
          </div>

          <div className="relative z-10 bg-[#F3F6F2] rounded-[32px] shadow-panel p-6 sm:p-10 lg:p-12 space-y-14">
            {/* Live Platform Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Active & Logged Reports', value: stats.totalReports, icon: FileSearch },
                { label: 'AI Potential Matches', value: stats.matchesFound, icon: Sparkles },
                { label: 'Items Safely Returned', value: stats.itemsRecovered, icon: CheckCircle2 },
                { label: 'Campus Zones Covered', value: stats.activeZones, icon: Compass },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#DDE2FF] text-[#303BFA] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-2xl sm:text-3xl text-[#11183B] tabular-nums leading-none">
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Core Concept Strip */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#303BFA]">
                  01 • SmartFind AI
                </span>
                <h3 className="font-heading font-bold text-xl text-[#11183B] mt-1">
                  AI finds the potential match.
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Weighted matching across description, category, campus zone, and timeframe immediately flags candidate pairs.
                </p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#303BFA]">
                  02 • TrustLoop
                </span>
                <h3 className="font-heading font-bold text-xl text-[#11183B] mt-1">
                  People verify the item.
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Owners submit private identifying details hidden from public listings and schedule safe in-person verification.
                </p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#303BFA]">
                  03 • Campus Security
                </span>
                <h3 className="font-heading font-bold text-xl text-[#11183B] mt-1">
                  Security ensures safe recovery.
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  High-value items, wallets, and ID cards are held securely and verified by Campus Security before handover.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <section id="how-it-works" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#303BFA]">
                    How It Works
                  </span>
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B] mt-1">
                    From scattered posts to verified recovery
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: 'Step 1',
                    title: 'Report Lost or Found',
                    desc: 'Upload a photo, choose the campus building, and save private identifying marks securely.',
                  },
                  {
                    step: 'Step 2',
                    title: 'SmartFind AI Scans',
                    desc: 'Our weighted scoring engine compares active lost and found items without exposing private clues.',
                  },
                  {
                    step: 'Step 3',
                    title: 'TrustLoop Connects',
                    desc: 'Owner sends a recovery request; finder accepts or involves Security and schedules a campus meetup.',
                  },
                  {
                    step: 'Step 4',
                    title: 'Verify & Handover',
                    desc: 'In-person confirmation of private details closes the loop and updates both records to Returned.',
                  },
                ].map((card) => (
                  <div
                    key={card.step}
                    className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-2"
                  >
                    <span className="inline-block px-3 py-1 rounded-full bg-[#DDE2FF] text-[#303BFA] text-xs font-bold">
                      {card.step}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-[#11183B] pt-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Main Features + SmartFind AI & TrustLoop Deep Dive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SmartFind AI Card */}
              <div
                id="smartfind-ai"
                className="bg-white rounded-3xl p-7 shadow-card border border-slate-100 space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#303BFA] text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-[#11183B]">
                      SmartFind AI Matching Engine
                    </h3>
                    <p className="text-xs text-slate-500">
                      Transparent weighted scoring with optional Gemini semantic enhancement
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Description & Colour', weight: '35%' },
                    { label: 'Item Category', weight: '25%' },
                    { label: 'Campus Proximity', weight: '25%' },
                    { label: 'Date Proximity', weight: '15%' },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="bg-[#F3F6F2] rounded-2xl p-3.5 flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-slate-700">{f.label}</span>
                      <span className="font-semibold text-sm text-[#303BFA] tabular-nums">
                        {f.weight}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Similarity scores (High 80+, Medium 60–79, Low 40–59) surface candidates for human review and never establish ownership by themselves.
                </p>
              </div>

              {/* TrustLoop + Campus Security Card */}
              <div
                id="trustloop"
                className="bg-[#303BFA] rounded-3xl p-7 text-white space-y-5 relative overflow-hidden"
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                      <Handshake className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl">
                        TrustLoop &amp; Campus Security
                      </h3>
                      <p className="text-xs text-white/80">
                        Structured person-to-person verification &amp; supervised custody
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-sm text-white/90">
                    <li className="flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-[#DDE2FF] shrink-0 mt-0.5" />
                      <span>
                        Sensitive items (ID cards, wallets, electronics) redact identifying digits publicly.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Users className="w-4 h-4 text-[#DDE2FF] shrink-0 mt-0.5" />
                      <span>
                        Controlled in-app messaging and scheduled meetups at Reception, Help Desk, or Security Office.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#DDE2FF] shrink-0 mt-0.5" />
                      <span>
                        Campus Security Administrators can hold valuables, verify physical claims, and audit every handover.
                      </span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#11183B] text-sm font-semibold hover:bg-[#DDE2FF] transition"
                    >
                      Join Your Campus Portal
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <BrandLogo to="/" dark />
                <span>•</span>
                <span>“Lost something? Let&apos;s find it.”</span>
              </div>
              <div className="flex flex-wrap items-center gap-5 font-medium">
                <Link to="/explore" className="hover:text-[#303BFA]">
                  Public Explore
                </Link>
                <Link to="/login" className="hover:text-[#303BFA]">
                  Student &amp; Admin Login
                </Link>
                <Link to="/register" className="hover:text-[#303BFA]">
                  Student Registration
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
