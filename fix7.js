const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');

// AnalysisView update
const targetAnalysis = `<div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Darshan Hours</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Dress Code</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                </div>
              </div>`;

const replaceAnalysis = `<div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Darshan Hours</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Dress Code</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Entries Today</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{(temple?.waitTime * 314 + 8540).toLocaleString()}</span>
                </div>
              </div>`;

// TempleDetailsModal update
const targetModal = `<div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Darshan Hours</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Dress Code</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                  </div>
                </div>`;

const replaceModal = `<div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Darshan Hours</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Dress Code</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Entries Today</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{(temple?.waitTime * 314 + 8540).toLocaleString()}</span>
                  </div>
                </div>`;

code = code.replace(targetAnalysis, replaceAnalysis);
code = code.replace(targetModal, replaceModal);

fs.writeFileSync('frontend/src/pages/DevoteeDashboard.jsx', code);
console.log('SUCCESS');
