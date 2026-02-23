import React from 'react';
import { motion } from 'motion/react';
import { MeterType } from '../../types/game';
import { Zap, Users, Scale, Coins, Shield } from 'lucide-react';

interface MeterBarProps {
  type: MeterType;
  value: number;
  label: string;
}

const METER_CONFIG: Record<MeterType, { color: string; icon: React.ElementType }> = {
  awe: { color: 'bg-amber-400', icon: Zap },
  cohesion: { color: 'bg-emerald-500', icon: Users },
  legitimacy: { color: 'bg-blue-500', icon: Scale },
  resources: { color: 'bg-yellow-600', icon: Coins },
  purity: { color: 'bg-purple-500', icon: Shield },
};

export const MeterBar: React.FC<MeterBarProps> = ({ type, value, label }) => {
  const config = METER_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex items-center gap-1 shrink-0 min-w-[60px]">
        <Icon size={10} className={config.color.replace('bg-', 'text-')} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      </div>
      <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 relative">
        <motion.div
          className={`h-full ${config.color} shadow-[0_0_5px_rgba(0,0,0,0.5)]`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-500 w-6 text-right">{Math.round(value)}</span>
    </div>
  );
};
