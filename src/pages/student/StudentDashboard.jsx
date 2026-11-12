import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Folder,
  PlusCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { listReports } from '../../services/reportService.js';
import { listHydratedMatches } from '../../services/matchService.js';
import { listRecoveryRequests } from '../../services/recoveryService.js';
import { RECOVERY_STATUS, REPORT_STATUS } from '../../config/constants.js';

function timeAgo(isoStr) {
  if (!isoStr) return 'Recently';
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lostCount: 0,
    foundCount: 0,
    matchCount: 0,
    recoveredCount: 0,
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    let mounted = true;

    Promise.all([
      listReports({ reporterId: user.uid, viewer: user }),
      listHydratedMatches({ userId: user.uid }),
      listRecoveryRequests({ userId: user.uid }),
      listReports({ includeClosed: false, viewer: user }),
    ])
      .then(([myReports, myMatches, myReqs, campusReports]) => {
        if (!mounted) return;
        const lostCount = myReports.filter((r) => r.type === 'lost').length;
        const foundCount = myReports.filter((r) => r.type === 'found').length;
        const recoveredCount = myReqs.filter(
          (r) => r.status === RECOVERY_STATUS.COMPLETED
        ).length;

        setStats({
          lostCount,
          foundCount,
          matchCount: myMatches.length,
          recoveredCount,
        });

        // Build unified recent activity feed matching design
        const feed = [];
        myMatches.slice(0, 2).forEach((m) => {
          feed.push({
            id: `m_${m.id}`,
            title: `Match: ${m.foundReport.itemName}`,
            subtitle: `${m.foundReport.location} • ${m.score}% similarity`,
            photoUrl: m.foundReport.photoUrl,
            status: REPORT_STATUS.MATCH_FOUND,
            to: '/student/matches',
            sortAt: m.createdAt,
          });
        });

        myReqs.slice(0, 2).forEach((rq) => {
          feed.push({
            id: `rq_${rq.id}`,
            title: `TrustLoop: ${rq.itemName}`,
            subtitle: `${rq.meeting?.location || 'Campus'} • ${timeAgo(rq.updatedAt)}`,
            photoUrl: rq.photoUrl,
            status: rq.status,
            to: '/student/recovery-requests',
            sortAt: rq.updatedAt,
          });
        });

        [...myReports, ...campusReports].slice(0, 4).forEach((rep) => {
          if (!feed.some((f) => f.title.includes(rep.itemName))) {
            feed.push({
              id: rep.id,
              title: `${rep.type === 'lost' ? 'Lost' : 'Found'}: ${rep.itemName}`,
              subtitle: `${rep.location} • ${timeAgo(rep.createdAt)}`,
              photoUrl: rep.photoUrl,
              status: rep.status,
              to: rep.reporterId === user.uid ? '/student/my-reports' : '/student/explore',
              sortAt: rep.createdAt,
            });
          }
        });

        feed.sort((a, b) => new Date(b.sortAt) - new Date(a.sortAt));
        setActivity(feed.slice(0, 4));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const firstName = (user?.name || 'Student').split(' ')[0];

  return (
    <PortalLayout role="student">
      <div className="space-y-6">
        {/* Greeting Header */}
        <div>
          <p className="text-sm font-semibold text-[#11183B]">
            Hey, {firstName} 👋
          </p>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#11183B] mt-0.5 tracking-tight">
            Welcome to FoundIt
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Report, find, and get your belongings back — all in one place.
          </p>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: 'Lost Reports',
              value: stats.lostCount,
              icon: Folder,
              to: '/student/my-reports',
            },
            {
              label: 'Found Reports',
              value: stats.foundCount,
              icon: Box,
              to: '/student/my-reports',
            },
            {
              label: 'Potential Matches',
              value: stats.matchCount,
              icon: Sparkles,
              to: '/student/matches',
            },
            {
              label: 'Items Recovered',
              value: stats.recoveredCount,
              icon: CheckCircle2,
              to: '/student/recovery-requests',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.to}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-slate-100 hover:border-[#DDE2FF] transition flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#EEF1FA] text-[#303BFA] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-sans font-semibold text-2xl sm:text-3xl text-[#11183B] tabular-nums leading-none">
                    {loading ? '—' : card.value}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1">
                    {card.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 2 Quick Action Pill Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/student/report-lost"
            className="flex items-center justify-between px-6 py-4 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white font-semibold text-sm sm:text-base shadow-pill transition group"
          >
            <span className="flex items-center gap-3">
              <Search className="w-5 h-5" />
              <span>Report Lost Item</span>
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/student/report-found"
            className="flex items-center justify-between px-6 py-4 rounded-full bg-white hover:bg-[#DDE2FF]/50 border border-slate-200/80 text-[#11183B] font-semibold text-sm sm:text-base shadow-card transition group"
          >
            <span className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-[#11183B]" />
              <span>Report Found Item</span>
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bottom 2-Column Section: Recent Activity + Promo Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Recent Activity */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-[#11183B]">
                Recent Activity
              </h2>
              <Link
                to="/student/my-reports"
                className="text-xs font-semibold text-[#303BFA] hover:underline"
              >
                View My Reports →
              </Link>
            </div>

            <div className="space-y-2.5">
              {activity.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-sm text-slate-500">
                  No recent activity yet. Report an item to get started.
                </div>
              ) : (
                activity.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.to)}
                    className="w-full text-left bg-white hover:bg-white/80 rounded-2xl p-3.5 shadow-card border border-slate-100 hover:border-[#DDE2FF] transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="w-11 h-11 rounded-xl object-cover bg-[#F3F6F2] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-sm text-[#11183B] truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Promotional Electric Blue Card */}
          <div className="lg:col-span-5 bg-[#303BFA] rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Geometric Ivory Corner Shape matching reference */}
            <div className="absolute -bottom-8 -right-8 w-44 h-44 bg-[#F3F6F2] rounded-tl-[48px] rotate-12 pointer-events-none" />

            <div className="relative z-10 max-w-[240px]">
              <h3 className="font-heading font-bold text-2xl sm:text-[26px] leading-tight">
                Lost something on campus?
              </h3>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                Let SmartFind AI scan found reports and notify you instantly.
              </p>
            </div>

            <div className="relative z-10 pt-6 flex items-center gap-3">
              <Link
                to="/student/matches"
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white text-[#11183B] hover:bg-[#DDE2FF] text-xs font-bold shadow-md transition"
              >
                <span>Find My Item</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
