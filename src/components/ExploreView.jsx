import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  CAMPUS_LOCATIONS,
  ITEM_CATEGORIES,
} from '../config/constants.js';
import { listReports } from '../services/reportService.js';
import { ItemCard } from './ItemCard.jsx';
import { ItemDetailModal } from './ItemDetailModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function ExploreView({ isPublic = false }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [location, setLocation] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReport, setSelectedReport] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listReports({
        type: tab,
        category,
        location,
        dateFrom,
        search,
        sortBy,
        includeClosed: false,
        viewer: isPublic ? null : user,
      });
      setReports(data);
    } catch (err) {
      setError(err.message || 'Unable to load campus reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [tab, category, location, dateFrom, sortBy, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B]">
            Explore Campus Reports
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isPublic
              ? 'Browse active campus lost & found items. Private identifying details are protected.'
              : 'Search reported lost and found items across campus zones.'}
          </p>
        </div>

        {/* Lost / Found / All Tabs */}
        <div className="inline-flex bg-white p-1 rounded-full border border-slate-200/80 shadow-sm self-start">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'lost', label: 'Lost' },
            { id: 'found', label: 'Found' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                tab === t.id
                  ? 'bg-[#303BFA] text-white'
                  : 'text-slate-600 hover:text-[#11183B]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item name, colour, description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-[#F3F6F2] text-xs font-medium text-[#11183B] focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
        >
          <option value="ALL">All Categories</option>
          {ITEM_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-[#F3F6F2] text-xs font-medium text-[#11183B] focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
        >
          <option value="ALL">All Locations</option>
          {CAMPUS_LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="From date"
            className="w-1/2 px-2.5 py-2.5 rounded-xl bg-[#F3F6F2] text-xs text-[#11183B] focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-1/2 px-2.5 py-2.5 rounded-xl bg-[#F3F6F2] text-xs font-medium text-[#11183B] focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="date_desc">Event Date</option>
          </select>
        </div>
      </div>

      {/* States: Loading / Error / Empty / Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-5 h-52 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-2">
          <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
          <p className="text-sm font-semibold text-rose-900">{error}</p>
          <button
            onClick={loadItems}
            className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-card space-y-3">
          <Filter className="w-8 h-8 text-[#303BFA] mx-auto opacity-80" />
          <h3 className="font-heading font-bold text-lg text-[#11183B]">
            No matching items found
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try clearing your filters or submit a lost/found report so SmartFind AI can watch for new matches automatically.
          </p>
          <button
            onClick={() => {
              setTab('all');
              setSearch('');
              setCategory('ALL');
              setLocation('ALL');
              setDateFrom('');
            }}
            className="px-5 py-2.5 rounded-full bg-[#DDE2FF] text-[#11183B] text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ItemCard
              key={report.id}
              report={report}
              onViewDetails={setSelectedReport}
            />
          ))}
        </div>
      )}

      <ItemDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        actionSlot={
          isPublic ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#303BFA] text-white text-sm font-semibold hover:bg-[#232CD4]"
            >
              <Sparkles className="w-4 h-4" />
              Sign In to Claim / Match
            </Link>
          ) : (
            <Link
              to="/student/matches"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#303BFA] text-white text-sm font-semibold hover:bg-[#232CD4]"
            >
              <Sparkles className="w-4 h-4" />
              Check AI Matches
            </Link>
          )
        }
      />
    </div>
  );
}
