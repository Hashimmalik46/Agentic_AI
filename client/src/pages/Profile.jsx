import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Zap, Building2, Target, CheckCircle2, ChevronDown } from 'lucide-react';

export default function WorkspaceProfile() {
  const navigate = useNavigate();
  // In a real app, you would initialize this state from your router context or backend API
  const [profileData, setProfileData] = useState({
    startupName: 'Acme Corp',
    niche: 'B2B SaaS',
    targetRoles: 'CTO, VP of Logistics',
    location: 'North America, UK',
    companySize: '50-200 Employees',
    keywords: 'Shopify, B2B, Supply Chain'
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const industries = [
    'B2B SaaS', 'E-commerce', 'Fintech', 'Healthcare Tech', 
    'Logistics & Supply Chain', 'Real Estate', 'EdTech', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false); // Reset save state if user makes an edit
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    console.log('Updating profile in database:', profileData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleGenerateLeads = () => {
    setIsGenerating(true);
    console.log('Deploying LLM Agent with payload:', profileData);
    
    // Simulate API call for lead generation
    setTimeout(() => {
      setIsGenerating(false);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans relative overflow-x-hidden p-6 md:p-12 selection:bg-[#ba9eff]/30">
      
      {/* Deep Atmospheric Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#8455ef]/10 via-[#060e20] to-[#060e20] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#40485d]/30 pb-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-2">
              Workspace Configuration
            </h1>
            <p className="text-[#a3aac4] text-sm">
              Manage your startup identity and targeting matrix before deploying the agent.
            </p>
          </div>
          
          <button 
            onClick={handleUpdateProfile}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border transition-all text-sm font-medium tracking-wide ${
              isSaved 
                ? 'bg-[#ba9eff]/10 border-[#ba9eff]/40 text-[#ba9eff]' 
                : 'border-[#40485d]/50 text-[#dee5ff] hover:bg-[#ba9eff]/5 hover:border-[#ba9eff]/40'
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4 text-[#a3aac4]" />}
            {isSaved ? 'Profile Saved' : 'Save Changes'}
          </button>
        </div>

        {/* Editable Sections Container */}
        <div className="flex flex-col gap-8">
          
          {/* Section 1: Core Identity */}
          <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 border border-[#40485d]/20 shadow-[0_0_80px_-20px_rgba(186,158,255,0.05)]">
            <h2 className="text-lg font-semibold text-[#dee5ff] flex items-center gap-3 mb-8">
              <Building2 className="w-5 h-5 text-[#ba9eff]" />
              Startup Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col relative group">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Startup Name</label>
                <input
                  name="startupName"
                  value={profileData.startupName}
                  onChange={handleChange}
                  className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] focus:shadow-[0_15px_30px_-15px_rgba(105,156,255,0.15)]"
                />
              </div>
              <div className="flex flex-col relative group">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Industry</label>
                <div className="relative w-full">
                  <select
                    name="niche"
                    value={profileData.niche}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] appearance-none cursor-pointer"
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind} className="bg-[#060e20] text-[#dee5ff]">{ind}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3aac4] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Targeting Matrix */}
          <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 border border-[#40485d]/20 shadow-[0_0_80px_-20px_rgba(186,158,255,0.05)]">
            <h2 className="text-lg font-semibold text-[#dee5ff] flex items-center gap-3 mb-8">
              <Target className="w-5 h-5 text-[#699cff]" />
              Targeting Matrix
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col relative group">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Target Roles (Comma Separated)</label>
                <input
                  name="targetRoles"
                  value={profileData.targetRoles}
                  onChange={handleChange}
                  className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]"
                />
              </div>
              <div className="flex flex-col relative group">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Geographic Focus</label>
                <input
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]"
                />
              </div>
              <div className="flex flex-col relative group">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Company Size</label>
                <input
                  name="companySize"
                  value={profileData.companySize}
                  onChange={handleChange}
                  className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]"
                />
              </div>
              <div className="flex flex-col relative group">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Keywords / Tech Stack</label>
                <input
                  name="keywords"
                  value={profileData.keywords}
                  onChange={handleChange}
                  className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* --- THE EXECUTION ZONE --- */}
        <div className="mt-8 relative w-full rounded-3xl p-[1px] bg-gradient-to-r from-[#ba9eff]/40 via-[#699cff]/20 to-[#ba9eff]/40">
          <div className="w-full bg-[#060e20] rounded-[23px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-semibold text-[#dee5ff] mb-2">Deploy AI Scraper</h3>
              <p className="text-[#a3aac4] text-sm max-w-md">
                Initialize the agent using your saved targeting matrix. It will scour the web to generate a tailored list of high-intent leads.
              </p>
            </div>
            
            <button 
              onClick={handleGenerateLeads}
              disabled={isGenerating}
              className={`group flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-[#000000] font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${
                isGenerating 
                  ? 'bg-[#a3aac4] cursor-not-allowed opacity-80' 
                  : 'bg-gradient-to-r from-[#8455ef] to-[#ba9eff] hover:shadow-[0_0_30px_0_rgba(186,158,255,0.4)] hover:-translate-y-0.5'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#000000]/30 border-t-[#000000] rounded-full animate-spin" />
                  Compiling Data...
                </>
              ) : (
                <>
                  Generate Leads
                  <Zap className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
