import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCcw, Landmark, Users } from 'lucide-react';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSrLgE2faoSHSHA4reYSmnr6Eu8L1Qd0uRdbuR7KRz3a9dnrsNMqNgQwoNabwP8rH6SEFkXoO8uD1Mt/pub?gid=0&single=true&output=csv';

interface LeaderboardEntry {
  name: string;
  stage: string;
  members: number;
  resources: number;
}

export const LeaderboardView: React.FC<{ standalone?: boolean }> = ({ standalone = false }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-refresh every 30s in standalone mode
  useEffect(() => {
    if (!standalone) return;
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [standalone]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Mock data for initial testing
      if (SHEET_CSV_URL.includes('Zlh_Zlh')) {
         setEntries([
           { name: 'The Silent Order', stage: 'Megachurch', members: 1200, resources: 50000 },
           { name: "Durkheim's Dream", stage: 'Denomination', members: 450, resources: 12000 },
           { name: "Weber's Bureaucracy", stage: 'Sect', members: 85, resources: 2100 },
         ]);
         setLoading(false);
         return;
      }

      const response = await fetch(SHEET_CSV_URL);
      const text = await response.text();
      
      const rows = text.split('\n').slice(1);
      const parsed = rows.map(row => {
        const cols = row.split(',');
        return {
          name: cols[1]?.replace(/"/g, '') || 'Unnamed',
          stage: cols[2]?.replace(/"/g, '') || 'Cult',
          members: parseInt(cols[3]) || 0,
          resources: parseInt(cols[4]) || 0
        };
      }).filter(e => e.name !== 'Unnamed')
        .sort((a, b) => {
          const stageOrder = ['movement', 'cult', 'sect', 'denomination', 'megachurch'];
          const stageDiff = stageOrder.indexOf(b.stage.toLowerCase()) - stageOrder.indexOf(a.stage.toLowerCase());
          if (stageDiff !== 0) return stageDiff;
          return b.members - a.members;
        });

      setEntries(parsed);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className={`flex flex-col bg-slate-950 overflow-hidden relative ${standalone ? 'min-h-screen items-center' : 'h-full'}`}>
      <div className={`w-full flex flex-col ${standalone ? 'max-w-lg px-6 pt-8' : 'p-6'} flex-1`}>
        <div className="mb-6 text-center shrink-0">
          <h2 className={`font-serif text-amber-100 flex items-center justify-center gap-2 ${standalone ? 'text-3xl' : 'text-2xl'}`}>
            <Trophy className="text-amber-500" /> Hall of Manifestations
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">The greatest organizations in history</p>
          {standalone && (
            <p className="text-[9px] text-slate-600 mt-2">Auto-refreshes every 30s</p>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto space-y-3 ${standalone ? 'pb-8' : 'pb-20'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
               <RefreshCcw className="text-amber-500 animate-spin" />
               <p className="text-xs text-slate-600 italic">Reading the sacred scrolls...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center text-slate-600 text-sm mt-12 italic">
              No entries yet. The sacred scrolls are empty.
            </div>
          ) : (
            entries.map((entry, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={idx}
                className={`p-4 rounded-2xl border flex items-center gap-4 ${
                  idx === 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  idx === 0 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'
                }`}>
                  {idx + 1}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-200">{entry.name}</h3>
                    <span className="text-[10px] font-mono text-amber-500">{entry.members} members</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                     <div className="flex items-center gap-1"><Landmark size={10}/> {entry.stage}</div>
                     <div className="flex items-center gap-1">$ {entry.resources}</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={fetchLeaderboard}
        className={`absolute right-6 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 shadow-xl border border-slate-700 active:scale-95 transition-transform ${standalone ? 'bottom-6' : 'bottom-24'}`}
      >
        <RefreshCcw size={20} />
      </button>
    </div>
  );
};
