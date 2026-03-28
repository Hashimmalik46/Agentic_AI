import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-2">
          Dashboard
        </h1>
        <p className="text-[#a3aac4] text-sm">
          Your lead generation run will show up here.
        </p>
      </div>
    </div>
  );
}

