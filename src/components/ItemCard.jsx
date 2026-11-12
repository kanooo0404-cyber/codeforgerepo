import React from 'react';
import { Calendar, Lock, MapPin, Shield } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

export function ItemCard({ report, onViewDetails }) {
  const isLost = report.type === 'lost';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 hover:border-[#DDE2FF] hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3.5">
          <img
            src={report.photoUrl}
            alt={report.itemName}
            className="w-16 h-16 rounded-2xl object-cover bg-[#F3F6F2] border border-slate-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isLost
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-[#DDE2FF] text-[#303BFA]'
                }`}
              >
                {isLost ? 'Lost' : 'Found'}
              </span>
              <StatusBadge status={report.status} />
            </div>
            <h3 className="font-heading font-bold text-[#11183B] text-base truncate">
              {report.itemName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {report.category} • {report.colour || 'Unspecified'}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {report.description}
        </p>

        {report.isSensitive && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3 shrink-0" />
            <span>Identifying details protected</span>
          </div>
        )}

        {report.heldBySecurity && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg ml-1">
            <Shield className="w-3 h-3 shrink-0" />
            <span>Held at Security</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium text-[#11183B]">
            <MapPin className="w-3.5 h-3.5 text-[#303BFA]" />
            {report.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {report.date}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(report)}
          className="px-4 py-2 rounded-full bg-[#F3F6F2] hover:bg-[#303BFA] text-[#11183B] hover:text-white text-xs font-semibold transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
