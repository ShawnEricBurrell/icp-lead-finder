import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Filter } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import LeadCard from './LeadCard';

export default function ResultsSection({ leads, searchParams, onViewDetails }) {
  const avgScore = leads.length > 0 
    ? Math.round(leads.reduce((sum, l) => sum + l.lead_score, 0) / leads.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Search Results
          </h2>
          <p className="text-gray-500">
            Found <span className="font-semibold text-blue-600">{leads.length}</span> high-potential leads 
            in <span className="font-medium">{searchParams?.city}</span> • {searchParams?.industry}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600 font-medium">Total Leads</p>
              <p className="text-lg font-bold text-blue-700">{leads.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-600 font-medium">Avg Score</p>
              <p className="text-lg font-bold text-emerald-700">{avgScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="space-y-4">
        {leads.map((lead, index) => (
          <LeadCard 
            key={lead.id || index} 
            lead={lead} 
            index={index}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {leads.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No leads found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </motion.div>
  );
}