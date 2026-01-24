import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreBadge({ score, size = 'default' }) {
  const getScoreConfig = (score) => {
    if (score >= 95) {
      return {
        gradient: 'from-emerald-500 to-green-600',
        shadow: 'shadow-emerald-500/40',
        label: 'Excellent'
      };
    }
    if (score >= 85) {
      return {
        gradient: 'from-amber-500 to-orange-500',
        shadow: 'shadow-amber-500/40',
        label: 'Good'
      };
    }
    return {
      gradient: 'from-gray-400 to-gray-500',
      shadow: 'shadow-gray-500/40',
      label: 'Fair'
    };
  };

  const config = getScoreConfig(score);
  const sizeClasses = size === 'large' 
    ? 'px-5 py-2.5 text-lg' 
    : 'px-4 py-2 text-sm';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 bg-gradient-to-r ${config.gradient} ${sizeClasses} rounded-full text-white font-bold shadow-lg ${config.shadow}`}
    >
      <span>{score}%</span>
      <span className="opacity-80 font-medium">Match</span>
    </motion.div>
  );
}