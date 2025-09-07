import React, { useState, useEffect } from 'react';
import { Settings, Sparkles, Zap, Star, ArrowRight, Clock } from 'lucide-react';

const MaintenancePage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(3);

  const upcomingFeatures = [
    "Enhanced User Experience",
    "Lightning Fast Performance",
    "Advanced Analytics",
    "Smart Notifications",
    "Seamless Integrations",
    "Virtually Testing B-Bot"
  ];

  useEffect(() => {
    setIsVisible(true);

    // Animate feature rotation
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % upcomingFeatures.length);
    }, 2500);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 3 : prev + 1));
    }, 10000);

    return () => {
      clearInterval(featureInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen #bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6 overflow-hidden relative">

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-100 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-32 left-40 w-28 h-28 bg-indigo-100 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-pink-100 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
      </div>

      {/* Main content */}
      <div className={`max-w-4xl mx-auto text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        {/* Main icon with rotation animation */}
        <div className="relative mb-8">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-[#195C51] via-gray-900  to-[#195C51] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <Settings className="w-16 h-16 text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-[#195C51] via-gray-900  to-[#195C51] bg-clip-text text-transparent">
          We're Upgrading!
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Something amazing is coming your way. We're working behind the scenes to bring you incredible new features.
        </p>

        {/* Animated feature showcase */}
        <div className="mb-12 h-16 flex items-center justify-center">
          <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-white/20">
            <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
            <span className="text-lg font-semibold text-gray-700 transition-all duration-500">
              Coming Soon: {upcomingFeatures[currentFeature]}
            </span>
            <Star className="w-5 h-5 text-purple-500 animate-spin" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600 font-medium">Progress Update</span>
          </div>
          <div className="max-w-md mx-auto bg-white/50 rounded-full h-3 shadow-inner border border-white/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#195C51] via-gray-900  to-[#195C51] transition-all duration-1000 ease-out rounded-full relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% Complete</p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          {[
            { icon: Zap, title: "Faster", desc: "Lightning-speed performance" },
            { icon: Sparkles, title: "Smarter", desc: "AI-powered features" },
            { icon: Star, title: "Better", desc: "Enhanced user experience" }
          ].map((item, index) => (
            <div
              key={index}
              className={`bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <item.icon className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="rounded-2xl p-8 #text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4">Stay Tuned!</h2>
          <p className="mb-6 opacity-90">Be the first to experience our revolutionary updates</p>
          <button className="bg-gradient-to-br from-[#195C51] via-gray-900  to-[#195C51] text-white  px-8 py-3 rounded-full font-semibold hover:scale-125 transition-colors duration-200 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl">
            <span>Notify Me</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer message */}
        <p className="text-gray-500 mt-8 text-sm">
          Expected completion: Very Soon • Follow us for real-time updates
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;