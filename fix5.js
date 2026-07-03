const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');

const targetSignature = 'function AnalysisView({ temples, user, setActiveTab }) {';
const newSignature = `function AnalysisView({ temples, user, setActiveTab }) {
  const [sidebarSearch, setSidebarSearch] = useState('');
  const filteredSidebarTemples = temples.filter(t => 
    t.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
    t.location.toLowerCase().includes(sidebarSearch.toLowerCase())
  );`;

code = code.replace(targetSignature, newSignature);

const targetHeader = `<p className="text-sm text-slate-500 mt-1 relative z-10">AI crowd analysis & details</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {temples.map(t => (`;

const newHeader = `<p className="text-sm text-slate-500 mt-1 relative z-10 mb-4">AI crowd analysis & details</p>
          <div className="relative z-10">
            <input 
              type="text" 
              placeholder="Search temples..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {filteredSidebarTemples.map(t => (`;

code = code.replace(targetHeader, newHeader);

fs.writeFileSync('frontend/src/pages/DevoteeDashboard.jsx', code);
console.log('SUCCESS');
