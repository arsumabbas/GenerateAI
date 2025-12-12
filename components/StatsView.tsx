import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ReviewLog, Flashcard } from '../types';

interface StatsViewProps {
  logs: ReviewLog[];
  cards: Flashcard[];
}

const StatsView: React.FC<StatsViewProps> = ({ logs, cards }) => {
  // Process logs for daily activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const activityData = last7Days.map(date => {
    const count = logs.filter(l => new Date(l.timestamp).toISOString().split('T')[0] === date).length;
    return { date: date.slice(5), count }; // MM-DD
  });

  const totalReviews = logs.length;
  const learningCount = cards.filter(c => c.state === 'learning' || c.state === 'new').length;
  const matureCount = cards.filter(c => c.state === 'review' && c.interval > 21).length;
  const youngCount = cards.filter(c => c.state === 'review' && c.interval <= 21).length;

  return (
    <div className="p-6 pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900">Statistics</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Total Reviews</p>
            <p className="text-3xl font-bold text-brand-600 mt-1">{totalReviews}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Mature Cards</p>
            <p className="text-3xl font-bold text-emerald-500 mt-1">{matureCount}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Review Activity</h3>
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {activityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#8b5cf6' : '#e2e8f0'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Card Distribution</h3>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">New & Learning</span>
                    <span className="font-medium">{learningCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(learningCount / cards.length) * 100}%` }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Young (Interval &lt; 21d)</span>
                    <span className="font-medium">{youngCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${(youngCount / cards.length) * 100}%` }}></div>
                </div>
            </div>
             <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Mature (Interval &gt; 21d)</span>
                    <span className="font-medium">{matureCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(matureCount / cards.length) * 100}%` }}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;