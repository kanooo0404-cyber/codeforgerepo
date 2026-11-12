import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  PackageCheck,
  Search,
  Trash2,
} from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { ItemDetailModal } from '../../components/ItemDetailModal.jsx';
import { ITEM_CATEGORIES, REPORT_STATUS } from '../../config/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { closeOrRemoveReport, listReports } from '../../services/reportService.js';
import {
  markItemReturnedByAdmin,
  toggleHeldBySecurity,
} from '../../services/adminService.js';

export function AdminReportsPage({ reportType = 'lost' }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const isFound = reportType === 'found';

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await listReports({
        type: reportType,
        category,
        search,
        includeClosed: true,
        viewer: user,
      });
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [reportType, category, search]);

  const handleToggleHeld = async (rep) => {
    await toggleHeldBySecurity(rep.id, {
      heldBySecurity: !rep.heldBySecurity,
      actor: user,
    });
    showToast(
      rep.heldBySecurity
        ? `${rep.itemName} released from Security vault.`
        : `${rep.itemName} logged into Security custody.`
    );
    loadReports();
  };

  const handleMarkReturned = async (rep) => {
    await markItemReturnedByAdmin(rep.id, user);
    showToast(`${rep.itemName} marked as RETURNED.`);
    loadReports();
  };

  const handleRemove = async (rep) => {
    await closeOrRemoveReport(rep.id, REPORT_STATUS.REMOVED, user);
    showToast(`Report "${rep.itemName}" removed from public view.`, 'info');
    loadReports();
  };

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B]">
            {isFound ? 'Found Reports Management' : 'Lost Reports Management'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Inspect submitted reports, verify private identifying records, log Security custody, or remove inappropriate posts.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${reportType} items, campus locations...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#F3F6F2] text-xs font-semibold text-[#11183B]"
          >
            <option value="ALL">All Categories</option>
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 bg-[#F8F9FA]">
                  <th className="py-3.5 px-5 font-semibold">Item</th>
                  <th className="py-3.5 px-4 font-semibold">Reporter</th>
                  <th className="py-3.5 px-4 font-semibold">Location &amp; Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Loading reports...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No {reportType} reports match the current filters.
                    </td>
                  </tr>
                ) : (
                  reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-[#F8F9FA]/80">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={rep.photoUrl}
                            alt={rep.itemName}
                            className="w-10 h-10 rounded-xl object-cover bg-[#F3F6F2] shrink-0"
                          />
                          <div>
                            <div className="font-heading font-bold text-[#11183B]">
                              {rep.itemName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {rep.category} • {rep.colour}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#11183B]">
                        {rep.reporterName}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div>{rep.location}</div>
                        <div className="text-[11px] text-slate-400">{rep.date}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={rep.status} />
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelected(rep)}
                            className="p-2 rounded-full bg-[#F3F6F2] hover:bg-[#DDE2FF] text-[#11183B]"
                            title="Inspect full report & private clues"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isFound && rep.status !== REPORT_STATUS.RETURNED && rep.status !== REPORT_STATUS.REMOVED && (
                            <button
                              onClick={() => handleToggleHeld(rep)}
                              className={`p-2 rounded-full ${
                                rep.heldBySecurity
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-[#F3F6F2] hover:bg-[#DDE2FF] text-[#303BFA]'
                              }`}
                              title={
                                rep.heldBySecurity
                                  ? 'Release from Security Vault'
                                  : 'Log into Security Custody'
                              }
                            >
                              <PackageCheck className="w-4 h-4" />
                            </button>
                          )}
                          {rep.status !== REPORT_STATUS.RETURNED && rep.status !== REPORT_STATUS.REMOVED && (
                            <button
                              onClick={() => handleMarkReturned(rep)}
                              className="p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              title="Mark as Returned"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {rep.status !== REPORT_STATUS.REMOVED && (
                            <button
                              onClick={() => handleRemove(rep)}
                              className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700"
                              title="Remove inappropriate report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ItemDetailModal report={selected} onClose={() => setSelected(null)} />
    </PortalLayout>
  );
}
