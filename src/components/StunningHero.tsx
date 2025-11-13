import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Zap, 
  Download, 
  Users, 
  Clock, 
  Award,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Rocket,
  Globe,
  Shield
} from 'lucide-react';

interface StunningHeroProps {
  onGetStarted: () => void;
}

export const StunningHero: React.FC<StunningHeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden animate-in fade-in duration-700">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30"></div>
        
        {/* Floating elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-blue-200/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-50/40 rounded-full blur-3xl"></div>
        </div>
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">Syllabus Savvy</span>
            <div className="text-sm text-blue-600 font-medium">AI Notes Generator</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 px-3 py-1">
            <Shield className="w-3 h-3 mr-1" />
            100% FREE
          </Badge>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-3 py-1">
            <Globe className="w-3 h-3 mr-1" />
            No API Keys
          </Badge>
        </div>
      </nav>

      {/* Main Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="mb-8 animate-fade-in">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-6 py-3 text-base font-medium shadow-sm">
              <Sparkles className="w-5 h-5 mr-2" />
              Powered by FREE AI Models • Pakistani Education Focused
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 animate-slide-up leading-tight">
            Generate{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Comprehensive
            </span>
            <br />
            Study Notes with{' '}
            <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              FREE AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up-delay">
            Create detailed, comprehensive study notes for Pakistani boards using completely{' '}
            <span className="text-blue-600 font-semibold">FREE AI models</span> and educational resources. 
            <br className="hidden md:block" />
            <span className="text-gray-500">No paid API keys required!</span>
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fade-in-delay">
            <Card className="bg-white border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Content</h3>
                <p className="text-gray-600 leading-relaxed">15-50+ lines per topic with detailed explanations, examples, and practice questions</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">100% FREE AI</h3>
                <p className="text-gray-600 leading-relaxed">Ollama, Transformers.js, HuggingFace - completely free, no subscriptions</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Pakistani Boards</h3>
                <p className="text-gray-600 leading-relaxed">FBISE, BISE, BSEK aligned content with local examples and context</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-slide-up-delay-2">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 min-w-[200px]"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Generate Notes Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-10 py-4 text-lg rounded-2xl font-medium min-w-[200px] transition-all duration-300 hover:-translate-y-1"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-delay-3">
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">FREE</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">2000+</div>
              <div className="text-gray-600 font-medium">Words/Chapter</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Topics Covered</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
              <div className="text-gray-600 font-medium">Pakistani Boards</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features */}
      <div className="relative z-10 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Why Choose Our FREE AI Platform?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">No API Keys Required</h3>
                  <p className="text-gray-400 text-sm">Uses completely free AI models - Ollama, Transformers.js, HuggingFace</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Pakistani Education Focus</h3>
                  <p className="text-gray-400 text-sm">Content aligned with FBISE, BISE, BSEK curricula and local context</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Comprehensive Content</h3>
                  <p className="text-gray-400 text-sm">15-50+ lines per topic with examples, questions, and solutions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Professional PDFs</h3>
                  <p className="text-gray-400 text-sm">Download beautifully formatted study notes as PDF documents</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Smart Caching</h3>
                  <p className="text-gray-400 text-sm">Instant results for previously generated content</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Offline Capable</h3>
                  <p className="text-gray-400 text-sm">Works offline with Ollama - complete privacy and control</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
