const fs = require('fs');
const code = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');

const replacement = `          {stateFilter !== 'All' ? (
            <div className="relative col-span-2">
              <select
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all appearance-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              >
                <option value="">All Temples in {stateFilter}</option>
                {temples
                  .filter(t => t.location.includes(stateFilter))
                  .map(t => (
                    <option key={t._id} value={t.name}>{t.name}</option>
                  ))
                }
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          ) : (
            <div className="relative col-span-2 flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder="Search for any temple..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setShowSuggestions(false)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && searchTerm.length > 0 && filteredTemples.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden text-left">
                    {filteredTemples.map(t => (
                      <div 
                        key={t._id} 
                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchTerm(t.name);
                          setShowSuggestions(false);
                        }}
                      >
                        <img src={t.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=100&q=80"} alt={t.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="bg-saffron text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-sm whitespace-nowrap">
                Search
              </button>
            </div>
          )}
        </div>
      </div>`;

const startPattern = '          <div className="relative col-span-2 flex gap-3">';
const endPattern = '      {/* Greeting (Screen 5) */}';

const startIndex = code.indexOf(startPattern);
const endIndex = code.indexOf(endPattern);

if (startIndex > -1 && endIndex > startIndex) {
  const newCode = code.substring(0, startIndex) + replacement + '\n\n' + code.substring(endIndex);
  fs.writeFileSync('frontend/src/pages/DevoteeDashboard.jsx', newCode);
  console.log("SUCCESS");
} else {
  console.log("FAILED to find patterns.", startIndex, endIndex);
}
