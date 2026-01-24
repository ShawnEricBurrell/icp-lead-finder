import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  Target, TrendingUp, Lightbulb, Sparkles, RefreshCw,
  Award, ArrowRight, Clock, Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LeadInsights() {
  const [generating, setGenerating] = useState(false);

  const { data: insights = [], refetch } = useQuery({
    queryKey: ['lead-insights'],
    queryFn: () => base44.entities.LeadInsight.list('-report_date', 5)
  });

  const generateInsights = async () => {
    setGenerating(true);
    try {
      await base44.functions.invoke('generateLeadInsights', {});
      refetch();
    } catch (err) {
      console.error('Failed to generate insights:', err);
    } finally {
      setGenerating(false);
    }
  };

  const latestInsight = insights[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI Lead Insights
          </h2>
          <p className="text-gray-500 mt-1">Predictive analytics and strategic recommendations</p>
        </div>
        <Button
          onClick={generateInsights}
          disabled={generating}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {latestInsight && (
        <>
          {/* AI Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Executive Summary</h3>
                <p className="text-xs text-purple-600">
                  Generated on {new Date(latestInsight.report_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-purple-800 leading-relaxed whitespace-pre-wrap">
              {latestInsight.ai_summary}
            </p>
          </motion.div>

          {/* Conversion Predictions */}
          {latestInsight.conversion_predictions?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 border-b border-green-100">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Top Conversion Opportunities
                  </h3>
                  <Badge className="bg-green-100 text-green-700 ml-auto">
                    {latestInsight.conversion_predictions.length} Leads
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {latestInsight.conversion_predictions.map((pred, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-green-200 rounded-xl p-5 bg-green-50/50 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {pred.company_name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Expected: {pred.predicted_timeline}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {pred.conversion_probability}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Conversion Probability
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Why They'll Convert
                        </p>
                        <div className="space-y-1">
                          {pred.key_factors?.map((factor, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Zap className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Recommended Actions
                        </p>
                        <div className="space-y-1">
                          {pred.recommended_actions?.map((action, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Industry Trends */}
          {latestInsight.industry_trends?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Industry Trends & Patterns</h3>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestInsight.industry_trends.map((trend, idx) => (
                  <div
                    key={idx}
                    className="border border-blue-200 rounded-xl p-4 bg-blue-50/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{trend.industry}</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Trend:</span> {trend.trend}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Impact:</span> {trend.impact}
                    </p>
                    <div className="bg-blue-100 rounded-lg p-2 mt-2">
                      <p className="text-xs text-blue-800">
                        <span className="font-semibold">Opportunity:</span> {trend.opportunity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Optimal Strategies */}
          {latestInsight.optimal_strategies?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-900">Recommended Outreach Strategies</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {latestInsight.optimal_strategies.map((strategy, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-amber-200 rounded-xl p-5 bg-amber-50/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {strategy.strategy_name}
                      </h4>
                      <Badge className="bg-amber-100 text-amber-700 text-sm">
                        {strategy.success_rate}% Success Rate
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{strategy.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Best For
                        </p>
                        <p className="text-sm text-gray-700">{strategy.best_for}</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          How to Implement
                        </p>
                        <p className="text-sm text-gray-700">{strategy.implementation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* No Data State */}
      {!latestInsight && !generating && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Generate AI Insights</h3>
          <p className="text-gray-500 mb-4">
            Get predictive analytics and strategic recommendations for your leads
          </p>
          <Button onClick={generateInsights} className="bg-purple-600 hover:bg-purple-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      )}
    </div>
  );
}