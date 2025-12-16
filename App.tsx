import React, { useState, useEffect, useMemo } from 'react';
import { Home, Scan, List, Settings, Plus } from 'lucide-react';
import Scanner from './components/Scanner';
import Dashboard from './components/Dashboard';
import { AppView, DailyStats, FoodEntry } from './types';
import { analyzeFoodImage } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scannedResult, setScannedResult] = useState<Partial<FoodEntry> | null>(null);

  // Load data on mount
  useEffect(() => {
    const savedLog = localStorage.getItem('snapcal_log');
    if (savedLog) {
      try {
        setFoodLog(JSON.parse(savedLog));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('snapcal_log', JSON.stringify(foodLog));
  }, [foodLog]);

  // Calculate daily stats
  const stats = useMemo<DailyStats>(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const todayEntries = foodLog.filter(entry => entry.timestamp >= todayStart);
    
    return todayEntries.reduce((acc, entry) => ({
      totalCalories: acc.totalCalories + entry.calories,
      totalProtein: acc.totalProtein + entry.macros.protein,
      totalCarbs: acc.totalCarbs + entry.macros.carbs,
      totalFat: acc.totalFat + entry.macros.fat,
      goalCalories: 2200 // Default goal
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      goalCalories: 2200
    });
  }, [foodLog]);

  const handleScan = async (imageSrc: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeFoodImage(imageSrc);
      
      const newEntry: FoodEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl: imageSrc,
        ...analysis
      };

      setFoodLog(prev => [...prev, newEntry]);
      setIsAnalyzing(false);
      setView(AppView.DASHBOARD);
    } catch (error) {
      console.error("Analysis failed", error);
      setIsAnalyzing(false);
      alert("Could not identify food. Please try again.");
    }
  };

  return (
    <div className="h-screen w-full bg-gray-950 flex flex-col font-sans text-gray-100">
      {/* Dynamic Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {view === AppView.DASHBOARD && (
          <Dashboard 
            stats={stats} 
            todayLog={foodLog.filter(f => {
               const d = new Date(f.timestamp);
               const n = new Date();
               return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
            })} 
            onScanClick={() => setView(AppView.SCANNER)} 
          />
        )}
        
        {view === AppView.HISTORY && (
          <div className="flex-1 p-6 overflow-y-auto">
             <h2 className="text-2xl font-bold mb-6">History</h2>
             <div className="space-y-4">
                {foodLog.slice().reverse().map(entry => (
                   <div key={entry.id} className="bg-gray-900 p-4 rounded-xl flex gap-4">
                      {entry.imageUrl && <img src={entry.imageUrl} className="w-16 h-16 rounded-lg object-cover" />}
                      <div>
                         <p className="font-bold">{entry.name}</p>
                         <p className="text-sm text-gray-400">{new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}</p>
                         <p className="text-blue-400 font-mono mt-1">{entry.calories} kcal</p>
                      </div>
                   </div>
                ))}
                {foodLog.length === 0 && <p className="text-gray-500 text-center mt-10">No history available.</p>}
             </div>
          </div>
        )}

        {view === AppView.SETTINGS && (
           <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
              <Settings size={48} className="text-gray-700 mb-4" />
              <h2 className="text-xl font-bold text-gray-500">Settings</h2>
              <p className="text-gray-600 mt-2">Goal configuration coming soon.</p>
              <button 
                onClick={() => {
                  if(confirm("Clear all data?")) {
                    setFoodLog([]);
                    localStorage.removeItem('snapcal_log');
                  }
                }}
                className="mt-8 px-6 py-2 bg-red-500/10 text-red-500 rounded-full text-sm hover:bg-red-500/20"
              >
                Reset Data
              </button>
           </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="h-20 bg-gray-950 border-t border-gray-800 flex justify-around items-center px-2 pb-2 safe-area-pb">
        <button 
          onClick={() => setView(AppView.DASHBOARD)}
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition duration-200 ${view === AppView.DASHBOARD ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </button>

        <button 
          onClick={() => setView(AppView.SCANNER)}
          className="flex flex-col items-center justify-center -mt-8"
        >
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] border-4 border-gray-950 transition-transform active:scale-95">
            <Scan size={28} className="text-white" />
          </div>
          <span className="text-[10px] font-medium mt-1 text-gray-400">Scan</span>
        </button>

        <button 
          onClick={() => setView(AppView.HISTORY)}
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition duration-200 ${view === AppView.HISTORY ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <List size={24} />
          <span className="text-[10px] font-medium mt-1">Logs</span>
        </button>
      </nav>

      {/* Full Screen Modals/Overlays */}
      {view === AppView.SCANNER && (
        <Scanner 
          onCapture={handleScan} 
          onClose={() => setView(AppView.DASHBOARD)} 
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
};

export default App;
