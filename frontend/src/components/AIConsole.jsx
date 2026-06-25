import { useState, useEffect } from 'react';
import { CloudRain, Sun, CalendarDays } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function AIConsole() {
  const [weather, setWeather] = useState('Clear');
  const [isWeekend, setIsWeekend] = useState(false);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    fetch(`/api/ai/forecast?weather=${weather}&isWeekend=${isWeekend}`)
      .then(res => res.json())
      .then(data => setForecast(data));
  }, [weather, isWeekend]);

  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Predicted Footfall',
        data: [20000, 22000, 21000, 25000, 30000, isWeekend ? 65000 : 40000, isWeekend ? 70000 : 38000],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.4
      }
    ]
  };

  const barData = {
    labels: ['Volunteers', 'Security', 'Wheelchairs'],
    datasets: [
      {
        label: 'Resource Allocation Needs',
        data: forecast ? [forecast.volunteersNeeded, forecast.securityNeeded, forecast.wheelchairs] : [0,0,0],
        backgroundColor: ['#10B981', '#EF4444', '#3B82F6']
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#fff' } },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94A3B8' } },
      x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94A3B8' } }
    }
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h2 className="card-title">AI Simulation Variables</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Adjust environmental factors to see the Core AI Engines recalculate predictions.</p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <button 
            className={weather === 'Clear' ? '' : 'secondary'} 
            onClick={() => setWeather('Clear')}
          ><Sun size={18}/> Clear</button>
          
          <button 
            className={weather === 'Rain' ? '' : 'secondary'} 
            onClick={() => setWeather('Rain')}
          ><CloudRain size={18}/> Heavy Rain</button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <button 
            className={!isWeekend ? '' : 'secondary'} 
            onClick={() => setIsWeekend(false)}
          ><CalendarDays size={18}/> Weekday</button>
          
          <button 
            className={isWeekend ? '' : 'secondary'} 
            onClick={() => setIsWeekend(true)}
          ><CalendarDays size={18}/> Weekend / Festival</button>
        </div>

        {forecast && (
          <div style={{ padding: 20, background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <h4 style={{ color: 'var(--accent-gold)', marginBottom: 16 }}>Live Output: Resource Optimization Engine</h4>
            <div className="grid-2">
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{forecast.expectedCrowd.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Expected Crowd</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{forecast.volunteersNeeded}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Volunteers Needed</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>7-Day Crowd Prediction Engine</h3>
          <Line options={chartOptions} data={lineData} />
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Resource Sizing Output</h3>
          <Bar options={chartOptions} data={barData} />
        </div>
      </div>
    </div>
  );
}
