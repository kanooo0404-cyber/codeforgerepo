import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, PlusCircle, Search, Trash2, X } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { ItemDetailModal } from '../../components/ItemDetailModal.jsx';
import {
  CAMPUS_LOCATIONS,
  ITEM_CATEGORIES,
  REPORT_STATUS,
} from '../../config/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  closeOrRemoveReport,
  listReports,
  updateReport,
} from '../../services/reportService.js';

export function MyReportsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [detailItem, setDetailItem] = useState(null);
  const [editing, setEditing] = useState(null);

  const loadMine = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await listReports({
        type: tab,
        reporterId: user.uid,
        includeClosed: true,
        viewer: user,
      });
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMine();
  }, [user?.uid, tab]);

  const handleCloseReport = async (reportId) => {
    await closeOrRemoveReport(reportId, REPORT_STATUS.CLOSED, user);
    showToast('Report closed and excluded from active AI matching.');
    loadMine();
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    await updateReport(
      editing.id,
      {
        itemName: editing.itemName,
        category: editing.category,
        location: editing.location,
        description: editing.description,
        privateDetails: editing.privateDetails,
      },
      user
    );
    showToast('Report updated & AI matching refreshed.');
    setEditing(null);
    loadMine();
  };

  return (
    <PortalLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B]">
              My Reports
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your lost and found reports, update details, or close resolved items.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/student/report-lost"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#303BFA] text-white text-xs font-semibold hover:bg-[#232CD4]"
            >
              <Search className="w-3.5 h-3.5" />
              Report Lost
            </Link>
            <Link
              to="/student/report-found"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#11183B] border border-slate-200 text-xs font-semibold hover:bg-[#DDE2FF]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Report Found
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex bg-white p-1 rounded-full border border-slate-200/80">
          {[
            { id: 'all', label: 'All Reports' },
            { id: 'lost', label: 'Lost' },
            { id: 'found', label: 'Found' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                tab === t.id ? 'bg-[#303BFA] text-white' : 'text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-sm text-slate-500 shadow-card">
            You haven&apos;t submitted any reports in this category yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => {
              const isClosed = [
                REPORT_STATUS.CLOSED,
                REPORT_STATUS.RETURNED,
                REPORT_STATUS.REMOVED,
              ].includes(rep.status);

              return (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={rep.photoUrl}
                      alt={rep.itemName}
                      className="w-14 h-14 rounded-2xl object-cover bg-[#F3F6F2] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            rep.type === 'lost'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-[#DDE2FF] text-[#303BFA]'
                          }`}
                        >
                          {rep.type}
                        </span>
                        <StatusBadge status={rep.status} />
                      </div>
                      <h3 className="font-heading font-bold text-base text-[#11183B] mt-1 truncate">
                        {rep.itemName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {rep.category} • {rep.location} • {rep.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDetailItem(rep)}
                      className="px-3.5 py-2 rounded-full bg-[#F3F6F2] hover:bg-[#DDE2FF] text-xs font-semibold text-[#11183B]"
                    >
                      Details
                    </button>
                    {!isClosed && (
                      <>
                        <button
                          onClick={() => setEditing({ ...rep })}
                          className="p-2 rounded-full bg-[#F3F6F2] hover:bg-[#DDE2FF] text-[#11183B]"
                          title="Edit report"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCloseReport(rep.id)}
                          className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700"
                          title="Close report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ItemDetailModal report={detailItem} onClose={() => setDetailItem(null)} />

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11183B]/60 backdrop-blur-sm">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-panel space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-[#11183B]">
                Edit Report
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Item Name</label>
              <input
                type="text"
                required
                value={editing.itemName}
                onChange={(e) => setEditing({ ...editing, itemName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F3F6F2] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F6F2] text-sm"
                >
                  {ITEM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Location</label>
                <select
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F6F2] text-sm"
                >
                  {CAMPUS_LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F3F6F2] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Private Identifying Info
              </label>
              <textarea
                rows={2}
                value={editing.privateDetails || ''}
                onChange={(e) =>
                  setEditing({ ...editing, privateDetails: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#F3F6F2] text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#303BFA] text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </PortalLayout>
  );
}
