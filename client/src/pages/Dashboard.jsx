import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Star, TrendingUp, Users, ExternalLink,
  ChevronDown, ChevronUp, LogOut, Phone, Mail, Send, Zap, Clock,
} from 'lucide-react';
import { supabase } from '/lib/supabaseClient.jsx';
import { useAuth } from '../App';

const PRIORITY_COLORS = {
  HIGH:   { bg: 'bg-green-500/15 border-green-500/30',   text: 'text-green-400' },
  MEDIUM: { bg: 'bg-yellow-500/15 border-yellow-500/30', text: 'text-yellow-400' },
  LOW:    { bg: 'bg-[#a3aac4]/10 border-[#a3aac4]/25',   text: 'text-[#a3aac4]' },
};

function ScoreBar({ label, value, subtitle }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-2xl p-5 border border-[#40485d]/20 shadow-[0_0_80px_-35px_rgba(186,158,255,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-[#a3aac4]">{label}</div>
          {subtitle && <div className="text-xs text-[#a3aac4]/80 mt-1">{subtitle}</div>}
        </div>
        <div className="text-[#dee5ff] font-semibold tabular-nums">{clamped}%</div>
      </div>
      <div className="mt-4 h-2.5 rounded-full bg-[#060e20] border border-[#40485d]/30 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#8455ef] to-[#ba9eff]" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

function LeadCard({ lead }) {
  const [expanded, setExpanded] = useState(false);
  const priority = lead.priority || 'LOW';
  const pc = PRIORITY_COLORS[priority] || PRIORITY_COLORS.LOW;
  const scores = lead.scores || {};

  return (
    <div className="bg-[#060e20]/45 border border-[#40485d]/30 rounded-2xl p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

        {/* Left: info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#dee5ff] font-semibold">{lead.name}</span>
            {lead.rating != null && (
              <span className="flex items-center gap-1 text-xs text-[#ba9eff] bg-[#ba9eff]/10 border border-[#ba9eff]/20 px-2 py-0.5 rounded-lg">
                <Star className="w-3 h-3" /> {lead.rating}
                <span className="text-[#a3aac4]">({lead.review_count})</span>
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-lg border ${pc.bg} ${pc.text}`}>{priority}</span>
            {scores.final_score != null && (
              <span className="text-xs text-[#699cff] bg-[#699cff]/10 border border-[#699cff]/20 px-2 py-0.5 rounded-lg">
                Score: {scores.final_score}
              </span>
            )}
          </div>
          <div className="mt-1.5 text-sm text-[#a3aac4]">{lead.category} · {lead.address}</div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {lead.website ? (
              <a href={lead.website} target="_blank" rel="noreferrer" className="text-xs text-[#699cff] hover:underline flex items-center gap-1">
                {lead.website} <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs text-[#a3aac4]/60">No website</span>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="text-xs text-[#ba9eff] hover:underline flex items-center gap-1">
                <Phone className="w-3 h-3" /> {lead.phone}
              </a>
            )}
            {lead.emails?.[0] && (
              <a href={`mailto:${lead.emails[0]}`} className="text-xs text-green-400 hover:underline flex items-center gap-1">
                <Mail className="w-3 h-3" /> {lead.emails[0]}
              </a>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          {lead.emails?.[0] && (
            <a href={`mailto:${lead.emails[0]}`}
              className="px-3 py-2 rounded-xl text-sm font-semibold bg-[#699cff]/10 border border-[#699cff]/25 text-[#699cff] hover:bg-[#699cff]/15 transition-colors flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          )}
          {lead.phone && (
            <a href={`tel:${lead.phone}`}
              className="px-3 py-2 rounded-xl text-sm font-semibold bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500/15 transition-colors flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          )}
          {lead.google_maps_url && (
            <a href={lead.google_maps_url} target="_blank" rel="noreferrer"
              className="px-3 py-2 rounded-xl text-sm font-semibold bg-[#ba9eff]/10 border border-[#ba9eff]/25 text-[#ba9eff] hover:bg-[#ba9eff]/15 transition-colors">
              Maps
            </a>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-[#000000] hover:shadow-[0_0_20px_0_rgba(186,158,255,0.25)] transition-shadow flex items-center gap-1">
            Details {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#40485d]/25 space-y-3 text-sm">
          {scores.final_score != null && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'LLM Score',    val: scores.llm_score },
                { label: 'Website Gap',  val: scores.website_gap },
                { label: 'Signals',      val: scores.signals_score },
                { label: 'Final Score',  val: scores.final_score },
              ].map(({ label, val }) => (
                <div key={label} className="bg-[#091328]/60 rounded-xl p-3 border border-[#40485d]/20 text-center">
                  <div className="text-xs text-[#a3aac4]">{label}</div>
                  <div className="text-lg font-semibold text-[#dee5ff] mt-1">{val ?? '—'}</div>
                </div>
              ))}
            </div>
          )}
          {lead.why_approach && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
              <div className="text-xs text-green-400 font-medium mb-1">Why approach</div>
              <div className="text-[#dee5ff]/80">{lead.why_approach}</div>
            </div>
          )}
          {lead.why_not && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
              <div className="text-xs text-yellow-400 font-medium mb-1">Potential concern</div>
              <div className="text-[#dee5ff]/80">{lead.why_not}</div>
            </div>
          )}
          {lead.signal_matches?.length > 0 && (
            <div>
              <div className="text-xs text-[#a3aac4] mb-2 font-medium">Signal matches</div>
              <div className="flex flex-wrap gap-2">
                {lead.signal_matches.map((s, i) => (
                  <span key={i} className="text-xs bg-[#ba9eff]/10 border border-[#ba9eff]/20 text-[#ba9eff] px-2 py-1 rounded-lg">{s}</span>
                ))}
              </div>
            </div>
          )}
          {lead.website_flaws?.length > 0 && (
            <div>
              <div className="text-xs text-[#a3aac4] mb-2 font-medium">Website issues</div>
              <ul className="space-y-1">
                {lead.website_flaws.map((f, i) => (
                  <li key={i} className="text-xs text-[#dee5ff]/70 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {lead.negative_reviews?.length > 0 && (
            <div>
              <div className="text-xs text-[#a3aac4] mb-2 font-medium">Negative reviews</div>
              <div className="space-y-2">
                {lead.negative_reviews.map((r, i) => (
                  <div key={i} className="bg-[#091328]/60 rounded-xl p-2.5 border border-[#40485d]/20 text-xs">
                    <span className="text-[#ba9eff] font-medium">{r.author}</span>
                    <span className="text-[#a3aac4] ml-2">★{r.rating}</span>
                    <div className="text-[#dee5ff]/70 mt-1">{r.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Map a DB leads row to the LeadCard shape
function mapDbRow(row) {
  return {
    name:                 row.name,
    phone:                row.phone,
    emails:               row.emails || [],
    category:             row.category,
    address:              row.address,
    rating:               row.rating,
    review_count:         row.review_count,
    website:              row.website,
    google_maps_url:      row.google_maps_url,
    priority:             row.priority,
    why_approach:         row.why_approach,
    why_not:              row.why_not,
    signal_matches:       row.signal_matches || [],
    website_flaws:        row.website_flaws  || [],
    website_improvements: row.website_improvements || [],
    negative_reviews:     row.negative_reviews || [],
    scores: {
      llm_score:     row.llm_score,
      website_gap:   row.website_gap,
      signals_score: row.signals_score,
      final_score:   row.final_score,
    },
  };
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const [search, setSearch] = useState('');

  // DB state
  const [dbRuns,    setDbRuns]    = useState([]);
  const [activeRun, setActiveRun] = useState(null);   // full run row
  const [dbLeads,   setDbLeads]   = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Fresh run passed in via navigate (may or may not exist)
  const { result, profileData } = location.state || {};
  const freshRunId = result?.run_id ?? null;

  // ── Load run history ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase
      .from('runs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const runs = data || [];
        setDbRuns(runs);

        // Default: fresh run if it exists in history, else most-recent DB run
        if (freshRunId) {
          const freshRow = runs.find(r => r.id === freshRunId);
          if (freshRow) {
            setActiveRun(freshRow);
            setDbLeads(result.leads);   // already have leads from pipeline response
            return;
          }
        }
        if (runs.length > 0) fetchLeadsForRun(runs[0]);
      });
  }, [user]);

  const fetchLeadsForRun = useCallback(async (run) => {
    setLoadingLeads(true);
    setActiveRun(run);
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('run_id', run.id)
      .order('final_score', { ascending: false });
    setDbLeads((data || []).map(mapDbRow));
    setLoadingLeads(false);
  }, []);

  const handleSelectRun = (run) => {
    if (activeRun?.id === run.id) return;
    fetchLeadsForRun(run);
  };

  // ── Derive display values ──────────────────────────────────────────────────
  const leads = dbLeads;
  const meta  = activeRun
    ? { niche: activeRun.niche, service: activeRun.service, parsed: { location: activeRun.location }, high: activeRun.high, medium: activeRun.medium, low: activeRun.low }
    : result?.meta || {};

  const startupName = profileData?.startupName || 'Your Workspace';
  const niche       = meta.niche || '—';
  const locDisplay  = meta.parsed?.location || '—';

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(l =>
      [l.name, l.category, l.address, l.website, l.priority].some(v => (v || '').toLowerCase().includes(q))
    );
  }, [leads, search]);

  const metrics = useMemo(() => {
    const total        = leads.length;
    const withWebsites = leads.filter(l => Boolean(l.website)).length;
    const scores       = leads.map(l => l.scores?.final_score).filter(v => v != null);
    const avgScore     = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      total,
      withWebsites,
      websiteCoverage: Math.round((withWebsites / Math.max(total, 1)) * 100),
      avgScore,
      high:   meta.high   ?? leads.filter(l => l.priority === 'HIGH').length,
      medium: meta.medium  ?? leads.filter(l => l.priority === 'MEDIUM').length,
      low:    meta.low    ?? leads.filter(l => l.priority === 'LOW').length,
    };
  }, [leads, meta]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans relative overflow-x-hidden p-6 md:p-12 selection:bg-[#ba9eff]/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#8455ef]/12 via-[#060e20] to-[#060e20] pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <span className="text-xs text-[#a3aac4]">{user?.email}</span>
        <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-[#a3aac4] hover:text-[#dee5ff] transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#40485d]/25 pb-6">
          <div>
            <button onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-sm text-[#a3aac4] hover:text-[#dee5ff] transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to profile
            </button>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.02em] text-[#dee5ff]">
              {startupName}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]"> Dashboard</span>
            </h1>
            <p className="text-[#a3aac4] text-sm mt-2">
              Niche: <span className="text-[#dee5ff] font-medium">{niche}</span>
              <span className="mx-2 text-[#40485d]">•</span>
              Service: <span className="text-[#dee5ff] font-medium">{meta.service || '—'}</span>
              <span className="mx-2 text-[#40485d]">•</span>
              Location: <span className="text-[#dee5ff] font-medium">{locDisplay}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-3 bg-[#091328]/60 backdrop-blur-[20px] rounded-2xl px-4 py-3 border border-[#40485d]/20">
              <Search className="w-4 h-4 text-[#a3aac4]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="bg-transparent outline-none text-sm text-[#dee5ff] placeholder:text-[#a3aac4] w-48" />
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-black hover:shadow-[0_0_20px_0_rgba(186,158,255,0.35)] transition-shadow whitespace-nowrap"
            >
              <Zap className="w-4 h-4" /> Generate New Leads
            </button>
          </div>
        </div>

        {/* Run History */}
        {dbRuns.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-[#a3aac4]" />
              <span className="text-xs text-[#a3aac4] font-medium uppercase tracking-wider">Run History</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dbRuns.map(run => (
                <button
                  key={run.id}
                  onClick={() => handleSelectRun(run)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    activeRun?.id === run.id
                      ? 'bg-[#ba9eff]/15 border-[#ba9eff]/40 text-[#ba9eff]'
                      : 'border-[#40485d]/30 text-[#a3aac4] hover:border-[#ba9eff]/30 hover:text-[#dee5ff]'
                  }`}
                >
                  {run.niche} · {fmt(run.created_at)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-2xl p-6 border border-[#40485d]/20 shadow-[0_0_80px_-35px_rgba(186,158,255,0.06)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#a3aac4]">Leads captured</div>
              <Users className="w-4.5 h-4.5 text-[#ba9eff]" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#dee5ff] tabular-nums">{metrics.total}</div>
            <div className="mt-4 flex gap-3 text-xs">
              <span className="text-green-400">HIGH {metrics.high}</span>
              <span className="text-yellow-400">MED {metrics.medium}</span>
              <span className="text-[#a3aac4]">LOW {metrics.low}</span>
            </div>
          </div>

          <ScoreBar
            label="Website coverage"
            value={metrics.websiteCoverage}
            subtitle={`${metrics.withWebsites}/${metrics.total} leads with websites`}
          />

          <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-2xl p-6 border border-[#40485d]/20 shadow-[0_0_80px_-35px_rgba(186,158,255,0.06)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#a3aac4]">Quality signals</div>
              <TrendingUp className="w-4.5 h-4.5 text-[#699cff]" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#dee5ff] tabular-nums">{metrics.avgScore}</div>
            <div className="text-xs text-[#a3aac4]/80 mt-1">Avg final score</div>
            {activeRun?.id && (
              <div className="mt-3 text-xs text-[#a3aac4]/60 font-mono truncate">run: {activeRun.id}</div>
            )}
          </div>
        </div>

        {/* Leads list */}
        <div className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-[#dee5ff]">Leads</h2>
            <div className="text-sm text-[#a3aac4]">{filteredLeads.length} shown</div>
          </div>

          {loadingLeads ? (
            <div className="text-center py-16 text-[#a3aac4]">
              <div className="w-6 h-6 border-2 border-[#ba9eff]/30 border-t-[#ba9eff] rounded-full animate-spin mx-auto mb-3" />
              Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16 text-[#a3aac4]">
              <p className="text-lg">No leads yet.</p>
              <p className="text-sm mt-2">Go back to profile and run the pipeline.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead, idx) => (
                <LeadCard key={`${lead.name}-${idx}`} lead={lead} />
              ))}
            </div>
          )}
        </div>

        {/* Bulk Email CTA */}
        {leads.length > 0 && (() => {
          const emailLeads = filteredLeads.filter(l => l.emails?.length > 0);
          return (
            <div className="mt-10 relative w-full rounded-3xl p-[1px] bg-gradient-to-r from-[#699cff]/40 via-[#ba9eff]/20 to-[#699cff]/40">
              <div className="w-full bg-[#060e20] rounded-[23px] p-7 md:p-9 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#dee5ff] mb-1">Bulk Email Campaign</h3>
                  <p className="text-[#a3aac4] text-sm">
                    {emailLeads.length} of {filteredLeads.length} leads have email addresses.
                    <span className="ml-1 text-[#699cff]">Connect an email provider to launch a campaign.</span>
                  </p>
                </div>
                <button
                  disabled
                  title="Email sending coming soon"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold tracking-wide whitespace-nowrap bg-gradient-to-r from-[#699cff] to-[#ba9eff] text-[#000000] opacity-60 cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  Send Bulk Email ({emailLeads.length})
                </button>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
