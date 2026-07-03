const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');

// 1. Fix the \n literal
code = code.replace(
  "{activeTab === 'explore' && <ExploreView temples={temples} setActiveTab={setActiveTab} user={user} />}\\n          {activeTab === 'analysis' && <AnalysisView temples={temples} user={user} />}",
  "{activeTab === 'explore' && <ExploreView temples={temples} setActiveTab={setActiveTab} user={user} />}\n          {activeTab === 'analysis' && <AnalysisView temples={temples} user={user} setActiveTab={setActiveTab} />}"
);

// 2. Add setActiveTab to AnalysisView signature
code = code.replace(
  'function AnalysisView({ temples, user }) {',
  'function AnalysisView({ temples, user, setActiveTab }) {'
);

// 3. Add Close button to the right panel of AnalysisView
const rightPanelStart = `<div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row relative">`;
const rightPanelWithClose = `<div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row relative">
        <button onClick={() => setActiveTab('explore')} className="absolute top-4 right-4 bg-white dark:bg-slate-950/60 p-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-slate-900 shadow-xl transition-all z-[60]">
          <X className="h-5 w-5" />
        </button>`;
        
code = code.replace(rightPanelStart, rightPanelWithClose);

fs.writeFileSync('frontend/src/pages/DevoteeDashboard.jsx', code);
console.log('SUCCESS');
