const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');

// 1. Update imports
code = code.replace(
  "import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';",
  "import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';"
);

// 2. Replace the old data generator with the new dynamic one
const oldData = `  const hourlyPredictionData = [
    { time: '6 AM', wait: 20, limit: 2000, crowd: 'Low' },
    { time: '8 AM', wait: temple?.waitTime * 0.8 || 15, limit: 3000, crowd: 'Moderate' },
    { time: '10 AM', wait: temple?.waitTime || 45, limit: 4500, crowd: 'High' },
    { time: '12 PM', wait: (temple?.waitTime || 45) * 1.5, limit: 5000, crowd: 'Peak' },
    { time: '2 PM', wait: (temple?.waitTime || 45) * 0.9, limit: 4000, crowd: 'High' },
    { time: '4 PM', wait: (temple?.waitTime || 45) * 0.7, limit: 3500, crowd: 'Moderate' },
    { time: '6 PM', wait: (temple?.waitTime || 45) * 1.1, limit: 4500, crowd: 'High' },
    { time: '8 PM', wait: 25, limit: 2500, crowd: 'Low' }
  ];`;

const oldData2 = `  const hourlyPredictionData = [
    { time: '6 AM', wait: 20, limit: 2000, crowd: 'Low' },
    { time: '8 AM', wait: temple.waitTime * 0.8, limit: 3000, crowd: 'Moderate' },
    { time: '10 AM', wait: temple.waitTime, limit: 4500, crowd: 'High' },
    { time: '12 PM', wait: temple.waitTime * 1.5, limit: 5000, crowd: 'Peak' },
    { time: '2 PM', wait: temple.waitTime * 0.9, limit: 4000, crowd: 'High' },
    { time: '4 PM', wait: temple.waitTime * 0.7, limit: 3500, crowd: 'Moderate' },
    { time: '6 PM', wait: temple.waitTime * 1.1, limit: 4500, crowd: 'High' },
    { time: '8 PM', wait: 25, limit: 2500, crowd: 'Low' }
  ];`;

const newData = `  const currentHour = new Date().getHours();
  const generateData = () => {
    const data = [];
    const baseWait = temple?.waitTime || 45;
    for (let h = 6; h <= 21; h++) {
      let multiplier = 0.3;
      if (h >= 9 && h <= 12) multiplier = 0.8 + (h === 11 ? 0.6 : 0);
      if (h >= 17 && h <= 19) multiplier = 0.7 + (h === 18 ? 0.4 : 0);
      if (h === 14 || h === 15) multiplier = 0.5;
      const noise = ((temple?._id?.charCodeAt(0) || 0) + h) % 3 === 0 ? 0.1 : -0.1;
      data.push({
        hour: h,
        time: h > 12 ? (h - 12) + ' PM' : (h === 12 ? '12 PM' : h + ' AM'),
        wait: Math.max(5, Math.floor(baseWait * (multiplier + noise))),
        isCurrent: h === currentHour
      });
    }
    return data;
  };
  const hourlyPredictionData = generateData();`;

code = code.replace(oldData, newData);
code = code.replace(oldData2, newData);

// 3. Replace the BarChart JSX
const oldChart = `<div className="h-48 w-full bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyPredictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: 12 }} />
                    <Bar dataKey="wait" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>`;
              
const oldChart2 = `<div className="h-36 w-full bg-white dark:bg-slate-950/40 p-2 rounded-xl border border-slate-200 dark:border-slate-800 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyPredictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={9} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: 10 }} />
                      <Bar dataKey="wait" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>`;

const newChart = `<div className="h-40 w-full bg-slate-50 dark:bg-slate-950/40 pt-4 pb-2 px-1 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 flex items-end">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyPredictionData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis 
                      dataKey="time" 
                      stroke="#94A3B8" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fill: '#64748B'}}
                      interval={2} 
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: 12, color: '#fff', border: '1px solid #334155' }} 
                      formatter={(value) => [\`\${value} mins\`, 'Est. Wait Time']}
                      labelStyle={{color: '#94A3B8', marginBottom: '4px'}}
                    />
                    <Bar dataKey="wait" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {hourlyPredictionData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.isCurrent ? '#FF6B35' : 'var(--bar-color, #475569)'} className="dark:[--bar-color:#334155] [--bar-color:#CBD5E1]" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>`;

code = code.replace(oldChart, newChart);
code = code.replace(oldChart2, newChart);

fs.writeFileSync('frontend/src/pages/DevoteeDashboard.jsx', code);
console.log('SUCCESS');
