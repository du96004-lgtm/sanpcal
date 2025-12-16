import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FoodEntry, DailyStats } from '../types';
import { Flame, Droplet, Wheat, Dumbbell } from 'lucide-react';

interface DashboardProps {
  stats: DailyStats;
  todayLog: FoodEntry[];
  onScanClick: () => void;
}

const COLORS = ['#3b82f6', '#1f2937']; // Blue and Gray

const MacroCard = ({ icon: Icon, label, value, color, unit = 'g' }: { icon: any, label: string, value: number, color: string, unit?: string }) => (
  <div className="bg-gray-900 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-800 shadow-lg">
    <div className={`p-2 rounded-full bg-gray-800 mb-2 ${color}`}>
      <Icon size={20} />
    </div>
    <span className="text-xl font-bold text-white">{value}{unit}</span>
    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, todayLog, onScanClick }) => {
  const remaining = Math.max(0, stats.goalCalories - stats.totalCalories);
  const percent = Math.min(100, (stats.totalCalories / stats.goalCalories) * 100);
  
  const data = [
    { name: 'Consumed', value: stats.totalCalories },
    { name: 'Remaining', value: remaining },
  ];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
      {/* Header */}
      <header className="p-6 pb-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Hello, User
        </h1>
        <p className="text-gray-400">Here's your daily breakdown</p>
      </header>

      {/* Main Calorie Ring */}
      <div className="relative h-64 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              startAngle={90}
              endAngle={-270}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
            >
              <Cell key="cell-0" fill="#3b82f6" />
              <Cell key="cell-1" fill="#1f2937" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute flex flex-col items-center">
            <Flame className="text-blue-500 mb-1" size={24} />
            <span className="text-4xl font-bold text-white">{stats.totalCalories}</span>
            <span className="text-sm text-gray-400">of {stats.goalCalories} kcal</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 px-6 mb-8">
        <MacroCard 
          icon={Dumbbell} 
          label="Protein" 
          value={stats.totalProtein} 
          color="text-emerald-400" 
        />
        <MacroCard 
          icon={Wheat} 
          label="Carbs" 
          value={stats.totalCarbs} 
          color="text-amber-400" 
        />
        <MacroCard 
          icon={Droplet} 
          label="Fat" 
          value={stats.totalFat} 
          color="text-rose-400" 
        />
      </div>

      {/* Recent Meals */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Today's Meals</h2>
          <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded-full">{todayLog.length} items</span>
        </div>
        
        <div className="space-y-3">
          {todayLog.length === 0 ? (
             <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
                <p className="text-gray-500 mb-4">No meals logged yet</p>
                <button 
                    onClick={onScanClick}
                    className="px-4 py-2 bg-gray-800 text-blue-400 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                >
                    Scan your first meal
                </button>
             </div>
          ) : (
            todayLog.slice().reverse().map((entry) => (
                <div key={entry.id} className="bg-gray-900 p-4 rounded-xl flex items-center border border-gray-800 hover:border-gray-700 transition">
                {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt={entry.name} className="w-14 h-14 rounded-lg object-cover bg-gray-800" />
                ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center text-gray-600">
                    <Flame size={20} />
                    </div>
                )}
                
                <div className="ml-4 flex-1">
                    <h3 className="text-white font-medium capitalize truncate">{entry.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">P: {entry.macros.protein}g</span>
                        <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">C: {entry.macros.carbs}g</span>
                        <span className="bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded text-[10px]">F: {entry.macros.fat}g</span>
                    </p>
                </div>
                
                <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-white">{entry.calories}</span>
                    <span className="text-[10px] text-gray-500 uppercase">kcal</span>
                </div>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;