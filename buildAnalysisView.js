const fs = require('fs');

const code = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');

const analysisViewCode = `
// ==========================================
// VIEW 1.5: TEMPLE ANALYSIS / QUICK REVIEW
// ==========================================
function AnalysisView({ temples, user }) {
  const [selectedId, setSelectedId] = useState(temples[0]?._id);
  const [bookingTemple, setBookingTemple] = useState(null);
  const temple = temples.find(t => t._id === selectedId) || temples[0];
  
  const hourlyPredictionData = [
    { time: '6 AM', wait: 20, limit: 2000, crowd: 'Low' },
    { time: '8 AM', wait: temple?.waitTime * 0.8 || 15, limit: 3000, crowd: 'Moderate' },
    { time: '10 AM', wait: temple?.waitTime || 45, limit: 4500, crowd: 'High' },
    { time: '12 PM', wait: (temple?.waitTime || 45) * 1.5, limit: 5000, crowd: 'Peak' },
    { time: '2 PM', wait: (temple?.waitTime || 45) * 0.9, limit: 4000, crowd: 'High' },
    { time: '4 PM', wait: (temple?.waitTime || 45) * 0.7, limit: 3500, crowd: 'Moderate' },
    { time: '6 PM', wait: (temple?.waitTime || 45) * 1.1, limit: 4500, crowd: 'High' },
    { time: '8 PM', wait: 25, limit: 2500, crowd: 'Low' }
  ];

  if (!temple) return null;

  return (
    <div className="h-[85vh] flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-saffron/10 rounded-full blur-2xl pointer-events-none"></div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 relative z-10">
            <Activity className="h-6 w-6 text-saffron" /> Insights
          </h2>
          <p className="text-sm text-slate-500 mt-1 relative z-10">AI crowd analysis & details</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {temples.map(t => (
            <button
              key={t._id}
              onClick={() => setSelectedId(t._id)}
              className={\`flex items-center gap-4 p-3 rounded-2xl transition-all text-left \${selectedId === t._id ? 'bg-saffron/10 border-saffron border shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}\`}
            >
              <img src={t.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=100&q=80"} alt={t.name} className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className={\`text-sm font-bold truncate \${selectedId === t._id ? 'text-saffron' : 'text-slate-900 dark:text-white'}\`}>{t.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" /> {t.location}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row relative">
        {/* Left Side: Image, General Info */}
        <div className="w-full lg:w-2/5 bg-slate-950 relative border-b lg:border-b-0 lg:border-r border-slate-800 lg:border-slate-850">
          <div className="h-64 lg:h-full relative">
            <img
              src={temple.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=600&q=80"}
              alt={temple.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-saffron font-bold text-xs uppercase tracking-widest block mb-1">DEITY TEMPLE DETAILS</span>
              <h3 className="text-3xl font-bold mb-2 leading-tight">{temple.name}</h3>
              <p className="text-slate-300 text-sm flex items-center gap-1"><MapPin className="h-4.5 w-4.5 text-saffron shrink-0" /> {temple.location}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Analysis Data */}
        <div className="w-full lg:w-3/5 p-6 lg:p-8 overflow-y-auto flex flex-col justify-between bg-white dark:bg-slate-900">
          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Temple History & Rules</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">{temple.history}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Darshan Hours</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Dress Code</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                </div>
              </div>
            </div>

            {/* AI Crowd Predictions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold animate-pulse" /> AI Crowd Prediction
                </h4>
                <span className="text-sm text-slate-600 dark:text-slate-400">Current Wait: <strong className="text-gold text-lg">{temple.waitTime}m</strong></span>
              </div>

              {/* Recharts Hourly Wait Times Forecast */}
              <div className="h-48 w-full bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyPredictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickMargin={10} />
                    <YAxis stroke="#94A3B8" fontSize={11} width={25} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: 12 }} />
                    <Area type="monotone" dataKey="wait" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-500 italic text-center">
                🔥 Best hours to visit: <strong className="text-emerald-500 dark:text-emerald-400">6:00 AM - 9:00 AM</strong>. Expect heavy peaks at noon due to afternoon Aarti.
              </p>
            </div>

            {/* Facilities list */}
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Available Facilities</h4>
              <div className="flex flex-wrap gap-2">
                {temple.facilities?.map(f => (
                  <span key={f} className="text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full shadow-sm">{f}</span>
                )) || 'None'}
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setBookingTemple(temple)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                Book Darshan Pass <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {bookingTemple && (
        <TempleDetailsModal
          temple={bookingTemple}
          user={user}
          onClose={() => setBookingTemple(null)}
        />
      )}
    </div>
  );
}
`;

// Insert AnalysisView before ExploreView
const exploreViewIndex = code.indexOf('// VIEW 1: HOME & TEMPLE DISCOVERY');
let newCode = code.slice(0, exploreViewIndex) + analysisViewCode + '\n' + code.slice(exploreViewIndex);

// Add the rendering in main content
const tabTarget = "{activeTab === 'explore' && <ExploreView temples={temples} setActiveTab={setActiveTab} user={user} />}";
newCode = newCode.replace(tabTarget, tabTarget + "\\n          {activeTab === 'analysis' && <AnalysisView temples={temples} user={user} />}");

// Update the button from "Book Quick Darshan" to "Quick Review"
const buttonTarget1 = "onClick={() => setSelectedTemple(temples[0])}";
const buttonReplacement1 = "onClick={() => setActiveTab('analysis')}";
newCode = newCode.replace(buttonTarget1, buttonReplacement1);

const buttonTarget2 = '<Calendar className="h-4 w-4" /> Book Quick Darshan';
const buttonReplacement2 = '<Activity className="h-4 w-4" /> Quick Review';
newCode = newCode.replace(buttonTarget2, buttonReplacement2);

fs.writeFileSync('frontend/src/pages/DevoteeDashboard.jsx', newCode);
console.log('SUCCESS');
