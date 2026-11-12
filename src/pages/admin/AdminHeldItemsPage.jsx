import React, { useEffect, useState } from 'react';
import { CheckCircle2, PackageCheck, Shield } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { REPORT_STATUS } from '../../config/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { listReports } from '../../services/reportService.js';
import {
  markItemReturnedByAdmin,
  toggleHeldBySecurity,
} from '../../services/adminService.js';

export function AdminHeldItemsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [heldItems, setHeldItems] = useState([]);
  const [otherFound, setOtherFound] = useState([]);
  const [shelfCodes, setShelfCodes] = useState({});
  const [loading, setLoading] = useState(true);

  const loadVault = async () => {
    setLoading(true);
    try {
      const foundReports = await listReports({
        type: 'found',
        includeClosed: false,
        viewer: user,
      });
      setHeldItems(foundReports.filter((r) => r.heldBySecurity));
      setOtherFound(
        foundReports.filter(
          (r) => !r.heldBySecurity && r.status !== REPORT_STATUS.RETURNED
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVault();
  }, []);

  const handleLogCustody = async (rep) => {
    await toggleHeldBySecurity(rep.id, {
      heldBySecurity: true,
      shelfCode: shelfCodes[rep.id] || `SEC-${Math.floor(100 + Math.random() * 899)}`,
      actor: user,
    });
    showToast(`${rep.itemName} logged into Campus Security vault.`);
    loadVault();
  };

  const handleMarkReturned = async (rep) => {
    await markItemReturnedByAdmin(rep.id, user);
    showToast(`${rep.itemName} released & marked RETURNED.`);
    loadVault();
  };

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#303BFA]">
            <Shield className="w-3.5 h-3.5" />
            Security Custody Inventory
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B] mt-1">
            Security-Held Belongings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage items safely stored at the Campus Security Office, assign shelf codes, and release items after verification.
          </p>
        </div>

        {/* Currently in Security Vault */}
        <div className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-[#11183B]">
            In Security Custody ({heldItems.length})
          </h2>

          {loading ? (
            <div className="h-28 bg-white rounded-2xl animate-pulse" />
          ) : heldItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-sm text-slate-500 shadow-card">
              No items currently held in the Security Vault.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heldItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 shadow-card border border-emerald-200/70 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.photoUrl}
                      alt={item.itemName}
                      className="w-16 h-16 rounded-2xl object-cover bg-[#F3F6F2] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          Shelf {item.securityShelfCode || 'SEC-VAULT'}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                      <h3 className="font-heading font-bold text-base text-[#11183B] mt-1">
                        {item.itemName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Found at {item.location} ({item.date}) • Logged by {item.reporterName}
                      </p>
                      {item.privateDetails && (
                        <p className="text-xs text-indigo-900 bg-[#DDE2FF]/50 rounded-xl px-3 py-1.5 mt-2">
                          Private Clue: {item.privateDetails}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleMarkReturned(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Release &amp; Mark Returned
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Additional Found Reports into Vault */}
        {otherFound.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="font-heading font-bold text-lg text-[#11183B]">
              Check-In Other Found Items to Security Vault
            </h2>
            <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-100 divide-y divide-slate-100">
              {otherFound.map((rep) => (
                <div
                  key={rep.id}
                  className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={rep.photoUrl}
                      alt={rep.itemName}
                      className="w-10 h-10 rounded-xl object-cover bg-[#F3F6F2]"
                    />
                    <div>
                      <p className="font-heading font-bold text-sm text-[#11183B]">
                        {rep.itemName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rep.category} • {rep.location} • Finder: {rep.reporterName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shelfCodes[rep.id] || ''}
                      onChange={(e) =>
                        setShelfCodes({ ...shelfCodes, [rep.id]: e.target.value })
                      }
                      placeholder="Shelf code (e.g. SEC-B04)"
                      className="w-40 px-3 py-1.5 rounded-full bg-[#F3F6F2] text-xs"
                    />
                    <button
                      onClick={() => handleLogCustody(rep)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white text-xs font-semibold"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      Check In
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
