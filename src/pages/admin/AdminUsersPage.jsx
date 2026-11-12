import React, { useEffect, useState } from 'react';
import { Ban, CheckCircle2, Shield, User, Users } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { listUsers, toggleUserSuspension } from '../../services/adminService.js';
import { listReports } from '../../services/reportService.js';

export function AdminUsersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [reportCounts, setReportCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [uList, rList] = await Promise.all([
        listUsers(),
        listReports({ includeClosed: true, viewer: user }),
      ]);
      const counts = {};
      rList.forEach((r) => {
        counts[r.reporterId] = (counts[r.reporterId] || 0) + 1;
      });
      setUsers(uList);
      setReportCounts(counts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleSuspend = async (target) => {
    try {
      const next = await toggleUserSuspension(target.uid, user);
      showToast(
        next ? `Suspended ${target.name}.` : `Restored ${target.name}.`,
        'info'
      );
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#303BFA]">
            <Users className="w-3.5 h-3.5" />
            Campus Directory
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B] mt-1">
            User Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor registered student accounts, verify campus roles, and suspend abusive accounts when necessary.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 bg-[#F8F9FA]">
                  <th className="py-3.5 px-5 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">ID &amp; Department</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Reports</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.uid} className="hover:bg-[#F8F9FA]">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                              u.role === 'admin'
                                ? 'bg-[#11183B] text-white'
                                : 'bg-[#DDE2FF] text-[#303BFA]'
                            }`}
                          >
                            {u.role === 'admin' ? (
                              <Shield className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-heading font-bold text-[#11183B]">
                              {u.name}
                            </div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="font-medium text-[#11183B]">
                          {u.studentId || '—'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {u.department || 'Campus'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-[#11183B] text-white'
                              : 'bg-[#DDE2FF] text-[#303BFA]'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold tabular-nums text-[#11183B]">
                        {reportCounts[u.uid] || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.isSuspended
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {u.uid !== user?.uid && (
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                              u.isSuspended
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            }`}
                          >
                            {u.isSuspended ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Restore
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                Suspend
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
