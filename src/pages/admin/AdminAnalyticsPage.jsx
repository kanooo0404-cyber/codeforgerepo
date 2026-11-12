import React, { useEffect, useState } from 'react';
import { BarChart3, History, MapPin } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import {
  CategoryDonutChart,
  RecoveryLineChart,
} from '../../components/AnalyticsCharts.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { listReports } from '../../services/reportService.js';
import { listHydratedMatches } from '../../services/matchService.js';
import { listRecoveryRequests } from '../../services/recoveryService.js';
import {
  buildAnalyticsSummary,
  listAuditLogs,
} from '../../services/adminService.js';

export function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [zoneStats, setZoneStats] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    Promise.all([
      listReports({ includeClosed: true, viewer: user }),
      listHydratedMatches({ isAdmin: true }),
      listRecoveryRequests({ isAdmin: true }),
      listAuditLogs(),
    ]).then(([reports, matches, requests, logs]) => {
      setSummary(buildAnalyticsSummary(reports, matches, requests));
      setAuditLogs(logs);

      const zoneCounts = {};
      reports.forEach((r) => {
        zoneCounts[r.location] = (zoneCounts[r.location] || 0) + 1;
      });
      setZoneStats(
        Object.entries(zoneCounts)
          .map(([zone, count]) => ({ zone, count }))
          .sort((a, b) => b.count - a.count)
      );
    });
  }, []);

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#303BFA]">
            <BarChart3 className="w-3.5 h-3.5" />
            Campus Intelligence &amp; Audit Trail
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B] mt-1">
            Analytics &amp; Administrative Activity
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track campus lost-item hotspots, recovery rates, and immutable security audit events.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
            <h2 className="font-heading font-bold text-lg text-[#11183B]">
              7-Day Activity &amp; Recovery Curve
            </h2>
            <RecoveryLineChart series={summary?.weeklySeries || []} />
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
            <h2 className="font-heading font-bold text-lg text-[#11183B]">
              Reports by Category
            </h2>
            <CategoryDonutChart
              categories={summary?.categoryBreakdown || []}
              totalReports={summary?.totalReports ?? 0}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Campus Zone Hotspots */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#303BFA]" />
              <h2 className="font-heading font-bold text-lg text-[#11183B]">
                Campus Zone Hotspots
              </h2>
            </div>
            <div className="space-y-3">
              {zoneStats.map((z) => {
                const max = Math.max(1, zoneStats[0]?.count || 1);
                return (
                  <div key={z.zone}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#11183B]">{z.zone}</span>
                      <span className="font-semibold tabular-nums text-slate-600">
                        {z.count} reports
                      </span>
                    </div>
                    <div className="h-2 bg-[#F3F6F2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#303BFA] rounded-full"
                        style={{ width: `${(z.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Administrative Activity Log */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#303BFA]" />
              <h2 className="font-heading font-bold text-lg text-[#11183B]">
                Administrative Audit Log
              </h2>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No administrative events logged yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#F3F6F2] rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#303BFA]">{log.action}</span>
                      <p className="text-[#11183B] font-medium mt-0.5">{log.details}</p>
                      <p className="text-slate-500 mt-0.5">
                        Actor: {log.actorName} • Target: {log.targetId}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
