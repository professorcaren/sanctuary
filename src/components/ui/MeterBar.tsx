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
    <div className="flex flex-col w-full mb-2">
      <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-300">
        <div className="flex items-center gap-1">
          <Icon size={12} />
          <span>{label}</span>
        </div>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <motion.div
          className={`h-full ${config.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
};
