import React, { useState } from 'react';
import { Search, MapPin, Building2, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

export default function SearchForm({ onSearch, isLoading }) {
  const [formData, setFormData] = useState({
    city: '',
    industry: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.city && formData.industry) {
      onSearch(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 p-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Find High-Potential Leads
              </h2>
              <p className="text-gray-500 text-sm">
                Discover companies needing rapid website services
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  City
                </Label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="e.g., San Francisco"
                  className="h-12 px-4 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Industry
                </Label>
                <Input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  placeholder="e.g., SaaS, E-commerce"
                  className="h-12 px-4 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.city || !formData.industry}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing companies...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5" />
                  <span>Find High-Potential Leads</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}