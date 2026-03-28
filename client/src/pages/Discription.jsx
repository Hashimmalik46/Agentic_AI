import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function LlmTargetingForm() {
  const [scrapeParams, setScrapeParams] = useState({
    targetRoles: '',
    location: '',
    companySize: '',
    keywords: ''
  });

  const handleForward = (e) => {
    e.preventDefault();
    console.log('Sending to LLM Scraper:', scrapeParams);
    // Trigger your LLM API call or move to the next step here
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#ba9eff]/30">
      
      {/* Subtle Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#699cff]/10 via-[#060e20] to-[#060e20] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 sm:p-12 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)]">
        
        <div className="mb-10">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-3">
            Define Target Matrix
          </h2>
          <p className="text-[#a3aac4] text-sm leading-relaxed">
            Provide the specific parameters for the AI agent to begin scraping. Be as precise as possible with keywords and roles.
          </p>
        </div>

        <form onSubmit={handleForward} className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Target Roles Field */}
            <div className="flex flex-col relative group">
              <label htmlFor="targetRoles" className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">
                Target Roles / Titles
              </label>
              <input
                id="targetRoles"
                type="text"
                required
                placeholder="e.g. CTO, VP of Logistics"
                className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff] focus:shadow-[0_15px_30px_-15px_rgba(105,156,255,0.15)]"
                value={scrapeParams.targetRoles}
                onChange={(e) => setScrapeParams({ ...scrapeParams, targetRoles: e.target.value })}
              />
            </div>

            {/* Location Field */}
            <div className="flex flex-col relative group">
              <label htmlFor="location" className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">
                Geographic Focus
              </label>
              <input
                id="location"
                type="text"
                required
                placeholder="e.g. North America, UK"
                className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff] focus:shadow-[0_15px_30px_-15px_rgba(105,156,255,0.15)]"
                value={scrapeParams.location}
                onChange={(e) => setScrapeParams({ ...scrapeParams, location: e.target.value })}
              />
            </div>

            {/* Company Size Field */}
            <div className="flex flex-col relative group">
              <label htmlFor="companySize" className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">
                Company Size
              </label>
              <input
                id="companySize"
                type="text"
                placeholder="e.g. 50-200 Employees"
                className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff] focus:shadow-[0_15px_30px_-15px_rgba(105,156,255,0.15)]"
                value={scrapeParams.companySize}
                onChange={(e) => setScrapeParams({ ...scrapeParams, companySize: e.target.value })}
              />
            </div>

            {/* Keywords / Tech Stack Field */}
            <div className="flex flex-col relative group">
              <label htmlFor="keywords" className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">
                Keywords / Tech Stack
              </label>
              <input
                id="keywords"
                type="text"
                placeholder="e.g. Shopify, B2B, Supply Chain"
                className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff] focus:shadow-[0_15px_30px_-15px_rgba(105,156,255,0.15)]"
                value={scrapeParams.keywords}
                onChange={(e) => setScrapeParams({ ...scrapeParams, keywords: e.target.value })}
              />
            </div>
          </div>

          {/* Action Area with Arrow Submit */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#40485d]/20">
            <button
              type="button"
              className="text-[#a3aac4] hover:text-[#dee5ff] transition-colors text-sm font-medium tracking-wide"
            >
              Cancel
            </button>
            
            {/* Arrow Key Submit Button */}
            <button
              type="submit"
              aria-label="Proceed to scrape"
              className="group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-[#000000] hover:shadow-[0_0_25px_0_rgba(186,158,255,0.4)] hover:scale-105 transition-all duration-300"
            >
              <ArrowRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}