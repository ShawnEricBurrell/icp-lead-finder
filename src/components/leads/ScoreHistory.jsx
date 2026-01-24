import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Minus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function ScoreHistory({ scoreHistory, currentScore }) {
  if (!scoreHistory || scoreHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No score changes recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scoreHistory.slice().reverse().map((entry, idx) => {
        const isIncrease = entry.change > 0;
        const isDecrease = entry.change < 0;
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-4 rounded-xl border-2 ${
              isIncrease ? 'bg-green-50 border-green-200' :
              isDecrease ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {isIncrease && <TrendingUp className="w-5 h-5 text-green-600" />}
                {isDecrease && <TrendingDown className="w-5 h-5 text-red-600" />}
                {!isIncrease && !isDecrease && <Minus className="w-5 h-5 text-gray-400" />}
                
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    isIncrease ? 'text-green-700' :
                    isDecrease ? 'text-red-700' :
                    'text-gray-700'
                  }`}>
                    {entry.previous_score} → {entry.new_score}
                  </span>
                  <Badge className={
                    isIncrease ? 'bg-green-100 text-green-700' :
                    isDecrease ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {entry.change > 0 ? '+' : ''}{entry.change} pts
                  </Badge>
                </div>
              </div>
              
              <span className="text-xs text-gray-500">
                {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                {new Date(entry.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            <p className={`text-sm leading-relaxed ${
              isIncrease ? 'text-green-800' :
              isDecrease ? 'text-red-800' :
              'text-gray-700'
            }`}>
              {entry.reason}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}