import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Box,
  Calendar,
  CheckCircle2,
  FileText,
  Handshake,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { TrustLoopModal } from '../../components/TrustLoopModal.jsx';
import {
  CategoryDonutChart,
  RecoveryLineChart,
} from '../../components/AnalyticsCharts.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { listReports } from '../../services/reportService.js';
import { listHydratedMatches } from '../../services/matchService.js';
import {
  listRecoveryRequests,
  respondToRecoveryRequest,
  scheduleRecoveryMeeting,
  sendRecoveryMessage,
  submitVerificationDetails,
  verifyAndConfirmHandover,
} from '../../services/recoveryService.js';
import { buildAnalyticsSummary } from '../../services/adminService.js';
import { RECOVERY_STATUS } from '../../config/constants.js';

export function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [range, setRange] = useState('7d');
  const [summary, setSummary] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reports, matches, requests] = await Promise.all([
        listReports({ includeClosed: true, viewer: user }),
        listHydratedMatches({ isAdmin: true }),
        listRecoveryRequests({ isAdmin: true }),
      ]);

      const cutoffDays = range === '7d' ? 7 : range === '30d' ? 30 : 3650;
      const cutoffTime = Date.now() - cutoffDays * 86400000;
      const filteredReports = reports.filter(
        (r) => new Date(r.createdAt).getTime() >= cutoffTime
      );

      setSummary(buildAnalyticsSummary(filteredReports, matches, requests));
      setRecentRequests(
        requests
          .filter((r) => r.status !== RECOVERY_STATUS.REJECTED)
          .slice(0, 4)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [range]);

  const syncReq = async (updated) => {
    setSelectedReq((prev) => ({ ...prev, ...updated }));
    await loadData();
  };

  const pendingReviewCount = summary?.pendingRequests ?? 0;

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Admin Dashboard
            </p>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#11183B] mt-0.5 tracking-tight">
              Campus Lost &amp; Found
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Monitor reports, verify claims, and ensure items reach their owners.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200/80 shadow-sm self-start">
            <Calendar className="w-4 h-4 text-[#303BFA]" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="text-xs font-semibold text-[#11183B] bg-transparent focus:outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* 5 KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {[
            { label: 'Total Reports', val: summary?.totalReports ?? 0, icon: FileText },
            { label: 'Lost Reports', val: summary?.lostCount ?? 0, icon: Search },
            { label: 'Found Reports', val: summary?.foundCount ?? 0, icon: Box },
            { label: 'Potential Matches', val: summary?.potentialMatches ?? 0, icon: Sparkles },
            { label: 'Pending Requests', val: pendingReviewCount, icon: Handshake },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EEF1FA] text-[#303BFA] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-sans font-semibold text-2xl text-[#11183B] tabular-nums leading-none">
                    {loading ? '—' : kpi.val}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-1">
                    {kpi.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle 2-Column Section: Recent Recovery Requests + Action Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-[#11183B]">
                Recent Recovery Requests
              </h2>
              <Link
                to="/admin/recovery-requests"
                className="text-xs font-semibold text-[#303BFA] hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentRequests.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No active recovery requests right now.
                </p>
              ) : (
                recentRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F8F9FA] -mx-2 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={req.photoUrl}
                        alt={req.itemName}
                        className="w-11 h-11 rounded-xl object-cover bg-[#F3F6F2] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-sm text-[#11183B] truncate">
                          {req.itemName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          Req #{req.id} • {req.ownerName} ↔ {req.finderName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={req.status} />
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#303BFA] rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[210px]">
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#F3F6F2] rounded-tl-[44px] rotate-12 pointer-events-none" />
            <div className="relative z-10 max-w-[230px]">
              <h3 className="font-heading font-bold text-2xl leading-tight">
                {pendingReviewCount} request{pendingReviewCount === 1 ? '' : 's'} need your review.
              </h3>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                Verify ownership, schedule handover, and close the loop.
              </p>
            </div>
            <div className="relative z-10 pt-5">
              <Link
                to="/admin/verification"
                className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white text-[#11183B] hover:bg-[#DDE2FF] shadow-md transition"
                title="Open Verification Queue"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom 2-Column Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 space-y-4">
            <h2 className="font-heading font-bold text-lg text-[#11183B]">
              Recovery Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-8">
                <RecoveryLineChart series={summary?.weeklySeries || []} />
              </div>
              <div className="sm:col-span-4 space-y-3">
                <div className="bg-[#F3F6F2] rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-sans font-semibold text-xl text-[#11183B] tabular-nums leading-none">
                      {summary?.returnedCount ?? 0}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Items Recovered</div>
                  </div>
                </div>
                <div className="bg-[#F3F6F2] rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#DDE2FF] text-[#303BFA] flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-sans font-semibold text-xl text-[#11183B] tabular-nums leading-none">
                      {summary?.recoveryRate ?? 0}%
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Recovery Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-[#11183B]">
                Report by Category
              </h2>
              <Link
                to="/admin/analytics"
                className="text-xs font-semibold text-[#303BFA] hover:underline"
              >
                Full Analytics →
              </Link>
            </div>
            <CategoryDonutChart
              categories={summary?.categoryBreakdown || []}
              totalReports={summary?.totalReports ?? 0}
            />
          </div>
        </div>
      </div>

      <TrustLoopModal
        request={selectedReq}
        currentUser={user}
        onClose={() => setSelectedReq(null)}
        onRespond={async (id, payload) => {
          const updated = await respondToRecoveryRequest(id, { ...payload, actor: user });
          showToast('Request updated.');
          await syncReq(updated);
        }}
        onScheduleMeeting={async (id, payload) => {
          const updated = await scheduleRecoveryMeeting(id, { ...payload, actor: user });
          showToast('Handover meeting scheduled.');
          await syncReq(updated);
        }}
        onSendMessage={async (id, payload) => {
          const updated = await sendRecoveryMessage(id, { ...payload, actor: user });
          await syncReq(updated);
        }}
        onSubmitVerification={async (id, payload) => {
          const updated = await submitVerificationDetails(id, { ...payload, actor: user });
          await syncReq(updated);
        }}
        onVerifyHandover={async (id, payload) => {
          const updated = await verifyAndConfirmHandover(id, { ...payload, actor: user });
          showToast('Security verification logged!');
          await syncReq(updated);
        }}
      />
    </PortalLayout>
  );
}
