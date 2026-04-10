import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ArrowLeft, Loader2, Users, Smartphone, Wifi, Search,
  ChevronUp, ChevronDown, BookOpen, GraduationCap, Target,
  Clock, AlertTriangle, CheckCircle2, XCircle, Download, RefreshCw,
  Eye, Filter, Calendar
} from 'lucide-react';

// ── Tiny Badge helper ─────────────────────────────────────────────────────────
function Badge({ text, variant = 'default' }) {
  const styles = {
    default: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    red: 'bg-red-500/15 text-red-300 border-red-500/25',
    yellow: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${styles[variant]}`}>
      {text}
    </span>
  );
}

// ── Status dot ────────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const isCompleted = status === 'completed';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isCompleted ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/15 text-amber-400 border-amber-500/25'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
      {isCompleted ? 'Onboarded' : 'Pending'}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div className={`bg-[#0f172a]/70 border ${color} rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color.replace('border-', 'bg-').replace('/30', '/10')}`}>
        <Icon className={`w-6 h-6 ${color.replace('border-', 'text-').replace('/30', '')}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-extrabold text-white leading-none mt-1">{value}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
      </div>
    </div>
  );
}

// ── Sortable column header ────────────────────────────────────────────────────
function SortTh({ label, field, sortField, sortDir, onSort, className = '' }) {
  const active = sortField === field;
  return (
    <th
      className={`px-5 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-pointer select-none hover:text-white transition-colors whitespace-nowrap ${className}`}
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <span className="flex flex-col">
          <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${active && sortDir === 'asc' ? 'text-rose-400' : 'text-gray-600'}`} />
          <ChevronDown className={`w-2.5 h-2.5 ${active && sortDir === 'desc' ? 'text-rose-400' : 'text-gray-600'}`} />
        </span>
      </span>
    </th>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'completed' | 'pending'
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://skillup-backend-7nzs.onrender.com/api/users/admin/all');
      if (!res.ok) throw new Error('Cannot reach /api/users/admin/all — ensure the backend is running.');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const processedUsers = useMemo(() => {
    let result = [...users];

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(u => u.onboardingStatus === filterStatus);
    }

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(u => {
        const info = u.onboardingData?.basicInfo || {};
        return (
          u.email?.toLowerCase().includes(q) ||
          info.fullName?.toLowerCase().includes(q) ||
          info.location?.toLowerCase().includes(q) ||
          (u.onboardingData?.learningInterests || []).some(i => i.toLowerCase().includes(q))
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'name':
          valA = a.onboardingData?.basicInfo?.fullName || '';
          valB = b.onboardingData?.basicInfo?.fullName || '';
          break;
        case 'email': valA = a.email || ''; valB = b.email || ''; break;
        case 'location':
          valA = a.onboardingData?.basicInfo?.location || '';
          valB = b.onboardingData?.basicInfo?.location || '';
          break;
        case 'status': valA = a.onboardingStatus || ''; valB = b.onboardingStatus || ''; break;
        case 'createdAt': default:
          valA = new Date(a.createdAt || 0).getTime();
          valB = new Date(b.createdAt || 0).getTime();
          break;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, query, sortField, sortDir, filterStatus]);

  const stats = useMemo(() => ({
    total: users.length,
    completed: users.filter(u => u.onboardingStatus === 'completed').length,
    pending: users.filter(u => u.onboardingStatus !== 'completed').length,
    withInterests: users.filter(u => (u.onboardingData?.learningInterests || []).length > 0).length,
  }), [users]);

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-rose-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-10 py-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all focus:outline-none border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="w-14 h-14 bg-gradient-to-br from-rose-700 to-rose-500 flex items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.35)] border border-rose-500/30 shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-none">Superadmin Dashboard</h1>
              <p className="text-gray-500 text-sm font-medium mt-1">Read-only view of all registered learner profiles.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Total Learners" value={stats.total} color="border-blue-500/30" sublabel="All registered" />
          <StatCard icon={CheckCircle2} label="Onboarded" value={stats.completed} color="border-emerald-500/30" sublabel="Completed profile" />
          <StatCard icon={Clock} label="Pending" value={stats.pending} color="border-amber-500/30" sublabel="Incomplete" />
          <StatCard icon={Target} label="With Interests" value={stats.withInterests} color="border-purple-500/30" sublabel="Personalised tracks" />
        </div>

        {/* ── Main Table Card ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-[#0f172a]/60 rounded-3xl border border-white/5">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-5" />
            <p className="text-gray-400 font-semibold tracking-widest uppercase text-sm">Loading learner data...</p>
          </div>
        ) : error ? (
          <div className="p-10 border border-red-500/20 bg-red-500/10 rounded-3xl text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <p className="text-red-300 font-semibold text-lg">Backend Unreachable</p>
            <p className="text-gray-500 text-sm mt-2">{error}</p>
          </div>
        ) : (
          <div className="bg-[#0f172a]/80 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

            {/* Table toolbar */}
            <div className="p-5 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name, email, location, or interest..."
                  className="w-full bg-[#0a0f1e] border border-white/10 text-white text-sm font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-rose-500/50 transition-colors placeholder-gray-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                {['all', 'completed', 'pending'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filterStatus === s
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="px-6 py-3 border-b border-white/5 bg-black/10">
              <p className="text-xs text-gray-500 font-medium">
                Showing <span className="text-white font-bold">{processedUsers.length}</span> of <span className="text-white font-bold">{users.length}</span> learners
                {query && <span className="text-rose-400 ml-1">· filtered by "<em>{query}</em>"</span>}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" style={{ minWidth: '1100px' }}>
                <thead>
                  <tr className="bg-[#1e293b]/40 border-b border-white/5 text-gray-400">
                    <SortTh label="Name / Email" field="name"      {...{ sortField, sortDir, onSort: handleSort }} className="pl-6" />
                    <SortTh label="Joined" field="createdAt" {...{ sortField, sortDir, onSort: handleSort }} />
                    <SortTh label="Status" field="status"    {...{ sortField, sortDir, onSort: handleSort }} />
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Age / Gender</th>
                    <SortTh label="Location" field="location"  {...{ sortField, sortDir, onSort: handleSort }} />
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Education</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Learning Interests</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Device / Internet</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Constraints</th>
                    <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 pr-6">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {processedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                            <Shield className="w-7 h-7 text-gray-600" />
                          </div>
                          <p className="text-gray-400 font-bold text-lg">No results found</p>
                          <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    processedUsers.map((user) => {
                      const info = user.onboardingData?.basicInfo || {};
                      const edu = user.onboardingData?.education || {};
                      const access = user.onboardingData?.digitalAccess || {};
                      const prefs = user.onboardingData?.learningPreferences || {};
                      const support = user.onboardingData?.supportNeeds || {};
                      const constraints = user.onboardingData?.constraints || {};
                      const interests = user.onboardingData?.learningInterests || [];
                      const isExpanded = expandedId === user._id;

                      return (
                        <React.Fragment key={user._id}>
                          <tr className="hover:bg-white/[0.03] transition-colors group align-top">

                            {/* Name / Email */}
                            <td className="px-5 py-4 pl-6">
                              <div className="font-bold text-white text-sm tracking-tight">
                                {info.fullName || <span className="text-gray-600 italic font-normal">No name</span>}
                              </div>
                              <div className="text-[11px] text-rose-400/80 font-mono mt-0.5 truncate max-w-[180px]" title={user.email}>{user.email}</div>
                            </td>

                            {/* Joined */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                <Calendar className="w-3 h-3 text-gray-600 shrink-0" />
                                {formatDate(user.createdAt)}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <StatusDot status={user.onboardingStatus} />
                            </td>

                            {/* Age / Gender */}
                            <td className="px-5 py-4">
                              <div className="text-xs text-gray-300 font-semibold">{info.age ? `${info.age} yrs` : '—'}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">{info.gender || '—'}</div>
                            </td>

                            {/* Location */}
                            <td className="px-5 py-4">
                              <span className="text-xs text-gray-300 font-medium">{info.location || '—'}</span>
                            </td>

                            {/* Education */}
                            <td className="px-5 py-4">
                              <Badge text={edu.currentLevel || 'N/A'} variant="blue" />
                              {edu.lastFormalEducation && (
                                <div className="text-[10px] text-gray-500 mt-1 max-w-[130px] truncate" title={edu.lastFormalEducation}>{edu.lastFormalEducation}</div>
                              )}
                            </td>

                            {/* Interests */}
                            <td className="px-5 py-4">
                              {interests.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {interests.map((sk, i) => (
                                    <Badge key={i} text={sk} variant="purple" />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600 italic">None selected</span>
                              )}
                            </td>

                            {/* Device / Internet */}
                            <td className="px-5 py-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                  <Smartphone className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span>{access.smartphone === 'Yes' ? 'Has smartphone' : 'No smartphone'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                  <Wifi className="w-3 h-3 text-sky-400 shrink-0" />
                                  <span>{access.frequency || access.internetQuality || '—'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Constraints */}
                            <td className="px-5 py-4">
                              {constraints.family || constraints.work || constraints.barriers ? (
                                <div className="text-[10px] text-gray-400 max-w-[150px] line-clamp-2 leading-relaxed">
                                  {constraints.family || constraints.work || constraints.barriers}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600 italic">None listed</span>
                              )}
                            </td>

                            {/* Expand */}
                            <td className="px-5 py-4 pr-6 text-center">
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : user._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                              >
                                <Eye className="w-3 h-3" />
                                {isExpanded ? 'Close' : 'More'}
                              </button>
                            </td>
                          </tr>

                          {/* ── Expanded detail row ─────────────────────────── */}
                          {isExpanded && (
                            <tr className="bg-[#1e293b]/30">
                              <td colSpan="10" className="px-6 py-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                                  {/* Full Profile Block */}
                                  <div className="bg-[#0a0f1e]/80 rounded-xl p-4 border border-white/5 space-y-2">
                                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                      <GraduationCap className="w-3 h-3" /> Full Basic Info
                                    </p>
                                    {[
                                      ['Full Name', info.fullName],
                                      ['Age', info.age],
                                      ['Gender', info.gender],
                                      ['Location', info.location],
                                      ['Language', info.preferredLanguage],
                                    ].map(([k, v]) => (
                                      <div key={k} className="flex justify-between gap-3">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider shrink-0">{k}</span>
                                        <span className="text-xs text-gray-300 font-medium text-right">{v || '—'}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Education */}
                                  <div className="bg-[#0a0f1e]/80 rounded-xl p-4 border border-white/5 space-y-2">
                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                      <BookOpen className="w-3 h-3" /> Education Profile
                                    </p>
                                    {[
                                      ['Level', edu.currentLevel],
                                      ['Schooling', edu.previousSchooling],
                                      ['Can Read/Write', edu.canReadWrite],
                                      ['Vocational', edu.vocationalTraining],
                                    ].map(([k, v]) => (
                                      <div key={k} className="flex justify-between gap-3">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider shrink-0">{k}</span>
                                        <span className="text-xs text-gray-300 font-medium text-right">{v || '—'}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Learning Preferences */}
                                  <div className="bg-[#0a0f1e]/80 rounded-xl p-4 border border-white/5 space-y-2">
                                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                      <Target className="w-3 h-3" /> Learning Preferences
                                    </p>
                                    {[
                                      ['Format', (prefs.formats || []).join(', ')],
                                      ['Language', prefs.learningLanguage],
                                      ['Time Slot', prefs.time],
                                      ['Hours/Week', prefs.hoursPerWeek],
                                      ['Style', support.style],
                                      ['Needs Mentor', support.mentor],
                                    ].map(([k, v]) => (
                                      <div key={k} className="flex justify-between gap-3">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider shrink-0">{k}</span>
                                        <span className="text-xs text-gray-300 font-medium text-right">{v || '—'}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Constraints */}
                                  <div className="bg-[#0a0f1e]/80 rounded-xl p-4 border border-white/5 space-y-2">
                                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                      <AlertTriangle className="w-3 h-3" /> Constraints
                                    </p>
                                    {[
                                      ['Family', constraints.family],
                                      ['Work', constraints.work],
                                      ['Barriers', constraints.barriers],
                                      ['Accessibility', constraints.accessibility],
                                      ['Offline Need', access.offlineNeed],
                                    ].map(([k, v]) => (
                                      <div key={k} className="flex justify-between gap-3">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider shrink-0">{k}</span>
                                        <span className="text-xs text-gray-300 font-medium text-right">{v || '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
              <p className="text-xs text-gray-600">All data is read-only. Contact the system administrator to modify records.</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                <Shield className="w-3 h-3" />
                Superadmin Access Only
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
