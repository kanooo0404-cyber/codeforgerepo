import React from 'react';
import { Calendar, Clock, Lock, MapPin, Shield, Tag, User, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

export function ItemDetailModal({ report, onClose, actionSlot = null }) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11183B]/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-panel border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                report.type === 'lost'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-[#DDE2FF] text-[#303BFA]'
              }`}
            >
              {report.type === 'lost' ? 'Lost Item' : 'Found Item'}
            </span>
            <StatusBadge status={report.status} />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <img
              src={report.photoUrl}
              alt={report.itemName}
              className="w-full sm:w-44 h-44 rounded-2xl object-cover bg-[#F3F6F2] border border-slate-100 shrink-0"
            />
            <div className="flex-1 space-y-3">
              <h2 className="font-heading font-bold text-2xl text-[#11183B]">
                {report.itemName}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{report.description}</p>

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="flex items-center gap-2 bg-[#F3F6F2] px-3 py-2 rounded-xl">
                  <Tag className="w-3.5 h-3.5 text-[#303BFA]" />
                  <span className="font-medium text-[#11183B]">{report.category}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F3F6F2] px-3 py-2 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-[#303BFA]" />
                  <span className="font-medium text-[#11183B]">{report.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F3F6F2] px-3 py-2 rounded-xl">
                  <Calendar className="w-3.5 h-3.5 text-[#303BFA]" />
                  <span className="font-medium text-[#11183B]">{report.date}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F3F6F2] px-3 py-2 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-[#303BFA]" />
                  <span className="font-medium text-[#11183B]">
                    {report.time || 'Approx. daytime'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F3F6F2] rounded-2xl p-4 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-[#303BFA]" />
              <span>
                Reported by <strong className="text-[#11183B]">{report.reporterName}</strong>
              </span>
            </div>
            <div>
              Colour: <strong className="text-[#11183B]">{report.colour || 'Unspecified'}</strong>
            </div>
          </div>

          {report.heldBySecurity && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900">
              <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Held Safely by Campus Security</p>
                <p className="mt-0.5 text-emerald-800">
                  Item is stored at the Security Office{report.securityShelfCode ? ` (${report.securityShelfCode})` : ''}. Supervised handover is required.
                </p>
              </div>
            </div>
          )}

          {report.canViewPrivateDetails && report.privateDetails ? (
            <div className="bg-[#DDE2FF]/50 border border-[#303BFA]/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-[#303BFA] flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5" />
                Private Identifying Information (Visible only to Reporter & Admin)
              </p>
              <p className="text-sm text-[#11183B]">{report.privateDetails}</p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-slate-600">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                {report.sensitiveNotice ||
                  'Private identifying details are hidden publicly and verified person-to-person through TrustLoop.'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            {actionSlot}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#F3F6F2] hover:bg-slate-200 text-sm font-semibold text-[#11183B] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
