import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Star, TrendingUp, Users } from 'lucide-react';

function formatList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function ScoreBar({ label, value, subtitle }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-2xl p-5 border border-[#40485d]/20 shadow-[0_0_80px_-35px_rgba(186,158,255,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-[#a3aac4]">{label}</div>
          {subtitle ? <div className="text-xs text-[#a3aac4]/80 mt-1">{subtitle}</div> : null}
        </div>
        <div className="text-[#dee5ff] font-semibold tabular-nums">{clamped}%</div>
      </div>
      <div className="mt-4 h-2.5 rounded-full bg-[#060e20] border border-[#40485d]/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8455ef] to-[#ba9eff]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function MiniBars({ values }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-10">
      {values.map((v, idx) => {
        const height = Math.max(2, Math.round((v / max) * 40));
        return (
          <div
            key={idx}
            className="w-2.5 rounded-md bg-[#ba9eff]/25 border border-[#ba9eff]/20"
            style={{ height }}
            title={`${v}`}
          />
        );
      })}
    </div>
  );
}

function LeadRow({ lead }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#060e20]/45 border border-[#40485d]/30 rounded-2xl p-5">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="text-[#dee5ff] font-semibold truncate">{lead.name}</div>
          {lead.rating != null ? (
            <div className="flex items-center gap-1 text-xs text-[#ba9eff] bg-[#ba9eff]/10 border border-[#ba9eff]/20 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5" />
              <span className="tabular-nums">{lead.rating}</span>
            </div>
          ) : null}
          {lead.stage ? (
            <div className="text-xs text-[#a3aac4] bg-[#091328]/60 border border-[#40485d]/25 px-2 py-1 rounded-lg">
              {lead.stage}
            </div>
          ) : null}
          {lead.finalScore != null ? (
            <div className="text-xs text-[#dee5ff] bg-[#091328]/60 border border-[#40485d]/25 px-2 py-1 rounded-lg tabular-nums">
              Score {lead.finalScore}
            </div>
          ) : null}
        </div>
        <div className="mt-2 text-sm text-[#a3aac4]">
          <span className="text-[#a3aac4]">Location:</span> {lead.location || '—'}
          <span className="mx-2 text-[#40485d]">•</span>
          <span className="text-[#a3aac4]">Source:</span> {lead.source || 'Google Maps'}
        </div>
        <div className="mt-2 text-xs text-[#a3aac4]/80 truncate">
          {lead.website || 'No website captured'}
        </div>
        <div className="mt-2 text-xs text-[#a3aac4]/80 truncate">
          {lead.emails?.length ? `Emails: ${lead.emails.join(', ')}` : 'Emails: none found'}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#ba9eff]/10 border border-[#ba9eff]/25 text-[#ba9eff] hover:bg-[#ba9eff]/15 transition-colors">
          View
        </button>
        <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-[#000000] hover:shadow-[0_0_20px_0_rgba(186,158,255,0.25)] transition-shadow">
          Enrich
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileData = location.state?.profileData;
  const pipelineResult = location.state?.pipelineResult;

  const [search, setSearch] = useState('');

  const normalized = useMemo(() => {
    const fallback = {
      startupName: 'Your Workspace',
      niche: '—',
      targetRoles: '',
      location: '',
      companySize: '',
      keywords: ''
    };
    if (!profileData) return fallback;
    return {
      startupName: profileData.startupName || fallback.startupName,
      niche: profileData.niche || fallback.niche,
      targetRoles: profileData.targetRoles || '',
      location: profileData.location || '',
      companySize: profileData.companySize || '',
      keywords: profileData.keywords || ''
    };
  }, [profileData]);

  const leads = useMemo(() => {
    const fromPipeline = (pipelineResult?.leads || []).map((l) => ({
      name: l.name,
      rating: l.rating,
      location: l.address || l.category || '—',
      website: l.website,
      stage: l.priority || '—',
      source: 'Google Maps',
      emails: l.emails || [],
      finalScore: l.scores?.final_score
    }));

    if (fromPipeline.length) return fromPipeline;

    // Fallback mock data (shown only if user opens /dashboard directly)
    return [
      { name: 'Bright Dental Studio', rating: 4.6, location: 'Delhi', website: 'https://brightdental.example', stage: 'HIGH', source: 'Google Maps', emails: ['hello@brightdental.example'], finalScore: 82 },
      { name: 'OrthoCare Clinic', rating: 4.3, location: 'Delhi', website: 'https://orthocare.example', stage: 'MEDIUM', source: 'Google Maps', emails: [], finalScore: 55 },
      { name: 'Smile Avenue', rating: 4.7, location: 'Delhi', website: null, stage: 'HIGH', source: 'Google Maps', emails: [], finalScore: 77 },
    ];
  }, [pipelineResult?.leads]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(l =>
      [l.name, l.location, l.website, l.stage, l.source].some(v => (v || '').toLowerCase().includes(q))
    );
  }, [leads, search]);

  const metrics = useMemo(() => {
    const total = leads.length;
    const withWebsites = leads.filter(l => Boolean(l.website)).length;
    const avgRating = leads
      .map(l => (typeof l.rating === 'number' ? l.rating : null))
      .filter(v => v != null);
    const avgRatingValue = avgRating.length ? avgRating.reduce((a, b) => a + b, 0) / avgRating.length : 0;

    const scoreAvg = leads.reduce((a, l) => a + (l.finalScore || 0), 0) / Math.max(leads.length, 1);

    return {
      total,
      withWebsites,
      websiteCoverage: Math.round((withWebsites / Math.max(total, 1)) * 100),
      avgRating: Number(avgRatingValue.toFixed(1)),
      avgScore: Math.round(scoreAvg)
    };
  }, [leads]);

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans relative overflow-x-hidden p-6 md:p-12 selection:bg-[#ba9eff]/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#8455ef]/12 via-[#060e20] to-[#060e20] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#40485d]/25 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate('/profile', { state: normalized })}
                className="flex items-center gap-2 text-sm text-[#a3aac4] hover:text-[#dee5ff] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to profile
              </button>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.02em] text-[#dee5ff]">
              {normalized.startupName}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">
                {' '}Dashboard
              </span>
            </h1>
            <p className="text-[#a3aac4] text-sm mt-2">
              Industry: <span className="text-[#dee5ff] font-medium">{normalized.niche}</span>
              <span className="mx-2 text-[#40485d]">•</span>
              Target locations: <span className="text-[#dee5ff] font-medium">{formatList(normalized.location).join(', ') || '—'}</span>
            </p>
          </div>

          <div className="w-full md:w-[380px]">
            <div className="flex items-center gap-3 bg-[#091328]/60 backdrop-blur-[20px] rounded-2xl px-4 py-3 border border-[#40485d]/20">
              <Search className="w-4 h-4 text-[#a3aac4]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads, stages, websites..."
                className="w-full bg-transparent outline-none text-sm text-[#dee5ff] placeholder:text-[#a3aac4]"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-2xl p-6 border border-[#40485d]/20 shadow-[0_0_80px_-35px_rgba(186,158,255,0.06)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#a3aac4]">Leads captured</div>
              <Users className="w-4.5 h-4.5 text-[#ba9eff]" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#dee5ff] tabular-nums">{metrics.total}</div>
            <div className="mt-4">
              <MiniBars values={[3, 7, 5, 10, 8, 12, 9, 14]} />
              <div className="mt-2 text-xs text-[#a3aac4]/80">Last 8 runs (mock)</div>
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
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-xs text-[#a3aac4]">Avg rating</div>
                <div className="text-2xl font-semibold text-[#dee5ff] tabular-nums">{metrics.avgRating || '—'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#a3aac4]">Avg fit score</div>
                <div className="text-2xl font-semibold text-[#dee5ff] tabular-nums">{metrics.avgScore}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#a3aac4]/80">
              <span className="text-[#ba9eff] font-medium">Tip:</span> Hook this to your Flask + SerpAPI pipeline for real-time updates.
            </div>
          </div>
        </div>

        <div className="mt-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-[#dee5ff]">Leads</h2>
            <div className="text-sm text-[#a3aac4]">
              {filteredLeads.length} shown
              {pipelineResult?.email_dispatch?.requested ? (
                <span className="ml-3 text-[#ba9eff]">
                  Emails: {pipelineResult.email_dispatch.sent_count} sent / {pipelineResult.email_dispatch.failed_count} failed
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            {filteredLeads.map((lead, idx) => (
              <LeadRow key={`${lead.name}-${idx}`} lead={lead} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
