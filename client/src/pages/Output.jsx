import React, { useState } from 'react';
import { Terminal, Check, Sparkles } from 'lucide-react';

export default function ExtractionDirectives() {
  const [signals, setSignals] = useState('');
  const [selectedData, setSelectedData] = useState(['Email', 'LinkedIn URL']); // Default selections

  const dataOptions = ['Email', 'LinkedIn URL', 'Phone Number', 'Company Website', 'Recent News/Funding', 'Tech Stack'];

  const toggleDataPoint = (point) => {
    setSelectedData(prev => 
      prev.includes(point) ? prev.filter(p => p !== point) : [...prev, point]
    );
  };

  const handleExecute = (e) => {
    e.preventDefault();
    console.log('Final Scraper Execution:', { signals, selectedData });
    // This is where you compile Page 1, Page 2, and Page 3 into the final LLM prompt.
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#ba9eff]/30">
      
      {/* Top-down ambient lighting for the final execution phase */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ba9eff]/10 via-[#060e20] to-[#060e20] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 sm:p-12 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)]">
        
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-3">
              Extraction Directives
            </h2>
            <p className="text-[#a3aac4] text-sm leading-relaxed">
              Define the buying signals and the exact payload you want the agent to extract.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#060e20] border border-[#ba9eff]/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_0_rgba(186,158,255,0.2)]">
            <Terminal className="w-5 h-5 text-[#ba9eff]" />
          </div>
        </div>

        <form onSubmit={handleExecute} className="flex flex-col gap-10">
          
          {/* Buying Signals / Triggers (Text Area) */}
          <div className="flex flex-col relative group">
            <label htmlFor="signals" className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-3 font-medium flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Buying Signals / Triggers
            </label>
            <textarea
              id="signals"
              rows="3"
              placeholder="e.g. Look for companies that recently raised funding or are actively hiring supply chain managers..."
              className="bg-[#060e20]/50 border border-[#40485d]/50 rounded-xl p-4 text-sm outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#ba9eff]/70 focus:bg-[#060e20]/80 focus:shadow-[0_15px_30px_-15px_rgba(186,158,255,0.15)] resize-none"
              value={signals}
              onChange={(e) => setSignals(e.target.value)}
            />
          </div>

          {/* Required Data Points (Interactive Pills) */}
          <div className="flex flex-col">
            <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-3 font-medium">
              Required Data Payload
            </label>
            <div className="flex flex-wrap gap-3">
              {dataOptions.map((point) => {
                const isSelected = selectedData.includes(point);
                return (
                  <button
                    key={point}
                    type="button"
                    onClick={() => toggleDataPoint(point)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium tracking-wide transition-all duration-300 ${
                      isSelected 
                        ? 'bg-[#ba9eff]/10 border-[#ba9eff]/50 text-[#dee5ff] shadow-[0_0_15px_0_rgba(186,158,255,0.15)]' 
                        : 'bg-transparent border-[#40485d]/40 text-[#a3aac4] hover:border-[#699cff]/50 hover:text-[#dee5ff]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-[#ba9eff]" />}
                    {point}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Area: Execute Scraping */}
          <div className="flex items-center justify-between mt-4 pt-6 border-t border-[#40485d]/20">
            <button
              type="button"
              className="text-[#a3aac4] hover:text-[#dee5ff] transition-colors text-sm font-medium tracking-wide"
            >
              Back
            </button>
            
            <button
              type="submit"
              className="group flex items-center gap-3 px-8 py-3.5 rounded-xl bg-[#dee5ff] text-[#000000] hover:bg-[#ffffff] hover:shadow-[0_0_30px_0_rgba(222,229,255,0.4)] hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold tracking-wide"
            >
              Compile & Execute
              <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}