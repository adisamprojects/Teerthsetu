const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');

// 1. Update imports
code = code.replace(
  "import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';",
  "import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';"
);

// 2. Replace AreaChart with BarChart in both AnalysisView and TempleDetailsModal
// We'll replace all instances of the AreaChart block.

const areaChartBlock1 = `<AreaChart data={hourlyPredictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickMargin={10} />
                    <YAxis stroke="#94A3B8" fontSize={11} width={25} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: 12 }} />
                    <Area type="monotone" dataKey="wait" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>`;

const areaChartBlock2 = `<AreaChart data={hourlyPredictionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} />
                      <YAxis stroke="#94A3B8" fontSize={9} width={15} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: 10 }} />
                      <Area type="monotone" dataKey="wait" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.15} />
                    </AreaChart>`;

const barChartBlock1 = `<BarChart data={hourlyPredictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: 12 }} />
                    <Bar dataKey="wait" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                  </BarChart>`;

const barChartBlock2 = `<BarChart data={hourlyPredictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={9} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: 10 }} />
                      <Bar dataKey="wait" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                    </BarChart>`;

code = code.replace(areaChartBlock1, barChartBlock1);
code = code.replace(areaChartBlock2, barChartBlock2);

fs.writeFileSync('frontend/src/pages/DevoteeDashboard.jsx', code);
console.log('SUCCESS');
