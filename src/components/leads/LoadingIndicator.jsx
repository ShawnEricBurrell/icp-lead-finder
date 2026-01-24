import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function LoadingIndicator() {
  const steps = [
    { icon: Search, text: 'Searching companies...', delay: 0 },
    { icon: Sparkles, text: 'Analyzing growth signals...', delay: 1 },
    { icon: TrendingUp, text: 'Scoring pain points...', delay: 2 },
    { icon: CheckCircle2, text: 'Enriching contact data...', delay: 3 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-16"
    >
      <div className="max-w-md mx-auto">
        {/* Animated circles */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-600"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"
              >
                <Search className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay * 0.5 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <motion.div
                animate={{ 
                  backgroundColor: ['#EFF6FF', '#DBEAFE', '#EFF6FF'],
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: step.delay * 0.3 }}
                className="p-2 rounded-lg"
              >
                <step.icon className="w-5 h-5 text-blue-600" />
              </motion.div>
              <span className="text-gray-700 font-medium">{step.text}</span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: step.delay * 0.5 }}
                className="flex-1 h-1 bg-blue-100 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, delay: step.delay * 0.5 + 0.5 }}
                  className="h-full bg-blue-500"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          This may take a moment while we analyze potential leads...
        </p>
      </div>
    </motion.div>
  );
}