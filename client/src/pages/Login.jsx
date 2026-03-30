import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '/lib/supabaseClient.jsx';

export default function Authentication() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans relative overflow-hidden flex flex-col items-center justify-center selection:bg-[#ba9eff]/30 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8455ef]/15 via-[#060e20] to-[#060e20] pointer-events-none" />

      <main className="relative z-10 w-full max-w-md">
        <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)] animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-2">
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">Back</span>
            </h1>
            <p className="text-[#a3aac4] text-sm">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col relative group">
              <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Email Address</label>
              <input
                required type="email" placeholder="e.g. name@company.com"
                className="w-full bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] placeholder:text-[#a3aac4]/50"
                value={formData.email} onChange={(e) => updateForm('email', e.target.value)}
              />
            </div>

            <div className="flex flex-col relative group">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] font-medium">Password</label>
              </div>
              <input
                required type="password" placeholder="••••••••"
                className="w-full bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] placeholder:text-[#a3aac4]/50 tracking-widest"
                value={formData.password} onChange={(e) => updateForm('password', e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={isLoading}
              className={`group flex items-center justify-center gap-2 mt-2 w-full py-3.5 rounded-xl text-[#000000] font-bold tracking-wide transition-all duration-300 ${
                isLoading ? 'bg-[#a3aac4] opacity-80 cursor-not-allowed' : 'bg-gradient-to-r from-[#8455ef] to-[#ba9eff] hover:shadow-[0_0_20px_0_rgba(186,158,255,0.3)] hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
              ) : (
                <>Access Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#a3aac4]">
            New to LeadScraper?{' '}
            <Link to="/signup" className="font-medium text-[#dee5ff] hover:text-[#ba9eff] transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
