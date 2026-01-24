import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, Linkedin, Clock, MapPin, 
  Building2, Users, Globe, ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScoreBadge from './ScoreBadge';

export default function LeadCard({ lead, index, onViewDetails }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                {lead.company_name?.charAt(0) || 'C'}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {lead.company_name}
                </h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{lead.location}</span>
                  <span className="text-gray-300">•</span>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{lead.industry}</span>
                </div>
              </div>
            </div>
          </div>
          <ScoreBadge score={lead.lead_score} />
        </div>
      </div>

      {/* Pain Point Banner */}
      <div className="mx-6 mb-4">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                Timer Pain Point
              </p>
              <p className="text-amber-900 font-medium leading-relaxed">
                {lead.timer_pain_point}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Grid */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Contact</p>
            <p className="font-semibold text-gray-900 truncate">{lead.contact_name || 'Unknown'}</p>
            <p className="text-sm text-gray-500 truncate">{lead.contact_title || 'Not specified'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</p>
            {lead.verified_email ? (
              <a 
                href={`mailto:${lead.verified_email}`}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="truncate">{lead.verified_email}</span>
              </a>
            ) : (
              <p className="text-gray-400 text-sm">Not available</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Phone</p>
            {lead.direct_phone ? (
              <a 
                href={`tel:${lead.direct_phone}`}
                className="flex items-center gap-1.5 text-gray-900 font-medium text-sm"
              >
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{lead.direct_phone}</span>
              </a>
            ) : (
              <p className="text-gray-400 text-sm">Not available</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">LinkedIn</p>
            {lead.linkedin_url ? (
              <a 
                href={lead.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>View Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-gray-400 text-sm">Not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {lead.company_size && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              <Users className="w-3 h-3 mr-1" />
              {lead.company_size}
            </Badge>
          )}
          {lead.website && (
            <a 
              href={`https://${lead.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lead.website}</span>
            </a>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewDetails(lead)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}