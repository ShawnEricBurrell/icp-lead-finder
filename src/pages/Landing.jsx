import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Sparkles, Search, Mail, RefreshCw, BarChart3, Zap, 
  CheckCircle2, FileText, Code, ArrowRight 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Base44 Template
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Lead Generation
            <br />
            <span className="text-blue-600">& Sales Automation</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find, score, and convert your ideal customers automatically. 
            Complete lead generation system with AI-powered outreach, CRM sync, and analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to={createPageUrl('Features')}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                <FileText className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
            </Link>
            <Link to={createPageUrl('Home')}>
              <Button size="lg" variant="outline" className="text-lg px-8">
                <ArrowRight className="w-5 h-5 mr-2" />
                Try Demo
              </Button>
            </Link>
          </div>

          {/* Screenshot Placeholder */}
          <div className="rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[87, 92, 78].map((score, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{score}</div>
                      <div className="text-sm text-gray-500">Lead Score</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Dashboard Preview</div>
                      <div className="text-sm text-gray-500">Real-time lead tracking & analytics</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Complete Lead Generation System
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to automate your sales pipeline from discovery to conversion
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Lead Generation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Automatically find and score leads by industry and location. AI analyzes company data, 
                  identifies pain points, and prioritizes opportunities with 0-100 scoring system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Email Automation</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI-generated personalized emails with template library, follow-up sequences, 
                  optimal send times, and performance tracking (opens, replies, conversions).
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">CRM Integration</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bidirectional sync with HubSpot, Salesforce, and Zoho. Custom field mapping, 
                  automated updates, sync history tracking, and error handling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-gray-600">Production-ready stack for reliability and performance</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Code className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>React 18</div>
                  <div>Tailwind CSS</div>
                  <div>Shadcn UI</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Base44 Platform</div>
                  <div>Deno Runtime</div>
                  <div>Serverless</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Sparkles className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">AI & APIs</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>OpenAI API</div>
                  <div>HubSpot API</div>
                  <div>Web Search</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Analytics</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Recharts</div>
                  <div>Real-time Data</div>
                  <div>React Query</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What's Included in This Template
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Complete Source Code</div>
                <div className="text-sm text-gray-600">Full access to all frontend and backend code</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">8 Backend Functions</div>
                <div className="text-sm text-gray-600">AI generation, CRM sync, email automation</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">7 Data Entities</div>
                <div className="text-sm text-gray-600">Pre-configured database schema</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">5 Scheduled Automations</div>
                <div className="text-sm text-gray-600">Daily CRM sync, email processing, lead scoring</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Analytics Dashboard</div>
                <div className="text-sm text-gray-600">Charts, metrics, performance tracking</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Setup Documentation</div>
                <div className="text-sm text-gray-600">Step-by-step deployment guide</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Email Templates</div>
                <div className="text-sm text-gray-600">Pre-built outreach sequences</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Responsive Design</div>
                <div className="text-sm text-gray-600">Mobile-optimized interface</div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to={createPageUrl('Features')}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <FileText className="w-5 h-5 mr-2" />
                View Full Technical Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          Built by{' '}
          <a 
            href="https://sb-digital-solutions.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            SB Digital Solutions
          </a>
        </div>
      </footer>
    </div>
  );
}