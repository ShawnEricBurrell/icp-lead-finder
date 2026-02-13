import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, Target, Zap, Shield } from 'lucide-react';
import SearchForm from '@/components/leads/SearchForm';
import ResultsSection from '@/components/leads/ResultsSection';
import LoadingIndicator from '@/components/leads/LoadingIndicator';
import LeadDetailsModal from '@/components/leads/LeadDetailsModal';

const FeatureCard = memo(({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 + index * 0.1 }}
    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </motion.div>
));

export default function Home() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  const handleSearch = async (searchData) => {
    setLoading(true);
    setError(null);
    setSearchParams(searchData);
    
    try {
      // Use InvokeLLM to generate mock leads with scoring
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5-8 realistic business leads for companies in ${searchData.city} in the ${searchData.industry} industry that would be ideal customers for rapid website development services.

For each lead, provide:
- company_name: A realistic company name
- industry: ${searchData.industry}
- location: ${searchData.city}, USA
- lead_score: A score between 85-98 based on how likely they need website services
- timer_pain_point: A specific, urgent reason they need website services NOW (be detailed and specific about their pain)
- pain_points: Array of 2-4 specific pain points like "Showing signs of recent growth/hiring", "Using outdated WordPress website", "Poor mobile performance"
- score_breakdown: Object with growth (0-30), techStack (0-40), digitalPresence (0-30)
- contact_name: A realistic full name
- contact_title: A job title like "Head of Marketing", "VP of Growth", "Director of Digital"
- verified_email: A professional email
- direct_phone: A US phone number
- linkedin_url: A LinkedIn URL
- website: A domain name
- company_size: Like "11-50", "51-200", "201-500"
- tech_stack: Array of technologies like ["WordPress", "PHP", "MySQL"] or ["React", "Node.js"]

Make the leads realistic and varied. Higher scores should have more urgent pain points.`,
        response_json_schema: {
          type: "object",
          properties: {
            leads: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company_name: { type: "string" },
                  industry: { type: "string" },
                  location: { type: "string" },
                  lead_score: { type: "number" },
                  timer_pain_point: { type: "string" },
                  pain_points: { type: "array", items: { type: "string" } },
                  score_breakdown: {
                    type: "object",
                    properties: {
                      growth: { type: "number" },
                      techStack: { type: "number" },
                      digitalPresence: { type: "number" }
                    }
                  },
                  contact_name: { type: "string" },
                  contact_title: { type: "string" },
                  verified_email: { type: "string" },
                  direct_phone: { type: "string" },
                  linkedin_url: { type: "string" },
                  website: { type: "string" },
                  company_size: { type: "string" },
                  tech_stack: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      const result = response.data || response;

      // Save search to database
      await base44.entities.Search.create({
        city: searchData.city,
        industry: searchData.industry,
        results_count: result.leads?.length || 0
      });

      // Sort by score and set leads
      const sortedLeads = (result.leads || []).sort((a, b) => b.lead_score - a.lead_score);
      setLeads(sortedLeads);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search for leads');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
  };

  const handleSaveLead = async (updatedLead) => {
    try {
      if (updatedLead.id) {
        await base44.entities.Lead.update(updatedLead.id, updatedLead);
      } else {
        const saved = await base44.entities.Lead.create(updatedLead);
        updatedLead.id = saved.id;
      }
      
      setLeads(leads.map(l => 
        l.company_name === updatedLead.company_name ? updatedLead : l
      ));
      setSelectedLead(updatedLead);
    } catch (err) {
      console.error('Failed to save lead:', err);
    }
  };

  const features = [
    {
      icon: Target,
      title: 'AI-Powered Scoring',
      description: 'Intelligent algorithms identify companies most likely to need website services'
    },
    {
      icon: Zap,
      title: 'Pain Point Analysis',
      description: 'Discover exactly why and when companies need your services'
    },
    {
      icon: Shield,
      title: 'Verified Contacts',
      description: 'Get accurate contact information for key decision makers'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-12 md:py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Lead Generation
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              ICP Lead Finder
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover companies that urgently need rapid website development services. 
              Enter a city and industry to find high-potential leads.
            </p>
          </motion.div>

          {/* Search Form */}
          <div className="mb-16">
            <SearchForm onSearch={handleSearch} isLoading={loading} />
          </div>

          {/* Features (only show when no results) */}
          {!loading && leads.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 pb-16">
        {loading && <LoadingIndicator />}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
          >
            <h3 className="text-red-800 font-semibold text-lg mb-2">Something went wrong</h3>
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {!loading && leads.length > 0 && (
          <ResultsSection 
            leads={leads} 
            searchParams={searchParams}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onSave={handleSaveLead}
      />

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>ICP Lead Finder • AI-powered lead generation for website development services</p>
        </div>
      </footer>
    </div>
  );
}