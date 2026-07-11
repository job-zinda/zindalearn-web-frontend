import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_MAP = {
  indigo:   { icon: 'text-indigo-400 bg-indigo-500/10', border: 'border-indigo-500/20' },
  emerald:  { icon: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/20' },
  amber:    { icon: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/20' },
  blue:     { icon: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/20' },
  red:      { icon: 'text-red-400 bg-red-500/10', border: 'border-red-500/20' },
  // legacy aliases
  purple:   { icon: 'text-indigo-400 bg-indigo-500/10', border: 'border-indigo-500/20' },
  rose:     { icon: 'text-red-400 bg-red-500/10', border: 'border-red-500/20' },
};

/**
 * AnalyticsCard — clean metric stat card.
 * Props:
 *   title   {string}
 *   value   {string|number}
 *   icon    {LucideIcon}
 *   trend   {number}         — optional % trend (positive = up, negative = down)
 *   color   {string}         — one of: indigo | emerald | amber | blue | red
 */
const AnalyticsCard = ({ title, value, icon: Icon, trend, color = 'indigo' }) => {
  const colors = COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-slate-600 transition-colors duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg ${colors.icon} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend !== undefined && trend !== null && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
              trend >= 0
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            }`}
          >
            {trend >= 0
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-slate-100 tracking-tight">{value}</p>
    </div>
  );
};

export default AnalyticsCard;
