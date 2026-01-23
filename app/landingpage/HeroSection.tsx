import Link from 'next/link';

export default function HeroSection() {
  return (
    <section id="home" className="relative pt-20 pb-24 lg:py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)' }}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20" style={{ backgroundColor: '#2563EB', filter: 'blur(80px)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20" style={{ backgroundColor: '#0D9488', filter: 'blur(100px)' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#10B981', filter: 'blur(60px)' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-center lg:text-left z-10">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
              <span className="text-sm font-semibold" style={{ color: '#2563EB' }}>✨ Trusted by Healthcare Professionals</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight" style={{ color: '#1E3A8A' }}>
              Streamline Healthcare
              <span className="block mt-2" style={{ background: 'linear-gradient(135deg, #2563EB, #0D9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Referrals with MedLink
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 leading-relaxed font-medium" style={{ color: '#374151' }}>
              A secure and fast referral management system connecting healthcare facilities seamlessly.
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold mb-1" style={{ color: '#2563EB' }}>500+</div>
                <div className="text-sm" style={{ color: '#6B7280' }}>Healthcare Facilities</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold mb-1" style={{ color: '#0D9488' }}>10K+</div>
                <div className="text-sm" style={{ color: '#6B7280' }}>Referrals Processed</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold mb-1" style={{ color: '#10B981' }}>99.9%</div>
                <div className="text-sm" style={{ color: '#6B7280' }}>Uptime</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/login"
                className="group px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
              >
                Get Started
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                style={{ backgroundColor: '#0D9488', color: '#FFFFFF', borderColor: '#0D9488' }}
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Side - Enhanced Illustration */}
          <div className="flex justify-center lg:justify-end z-10">
            <div className="relative w-full max-w-lg">
              {/* Main Card */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300" style={{ border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                {/* Glow Effect */}
                <div className="absolute -inset-1 rounded-3xl opacity-30 blur-xl" style={{ background: 'linear-gradient(135deg, #2563EB, #0D9488)' }}></div>
                
                <div className="relative space-y-6">
                  {/* Doctor Card */}
                  <div className="flex items-center space-x-4 p-5 rounded-xl transform hover:scale-105 transition-transform" style={{ backgroundColor: '#EFF6FF', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)' }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl shadow-lg" style={{ backgroundColor: '#2563EB' }}>
                      👨‍⚕️
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg" style={{ color: '#1E3A8A' }}>Doctor</p>
                      <p className="text-sm" style={{ color: '#6B7280' }}>Creates Referral</p>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2563EB', opacity: 0.1 }}>
                      <span className="text-xs font-bold" style={{ color: '#2563EB' }}>1</span>
                    </div>
                  </div>

                  {/* Animated Arrow */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-1 h-16 animate-pulse" style={{ backgroundColor: '#2563EB' }}></div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1" style={{ backgroundColor: '#2563EB' }}></div>
                      <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-t-4 border-b-4 border-transparent" style={{ borderLeftColor: '#2563EB' }}></div>
                    </div>
                  </div>

                  {/* System Card */}
                  <div className="flex items-center justify-center space-x-4 p-5 rounded-xl transform hover:scale-105 transition-transform" style={{ backgroundColor: '#EFF6FF', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)' }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl shadow-lg" style={{ backgroundColor: '#2563EB' }}>
                      💻
                    </div>
                    <div className="flex-1 text-center">
                      <p className="font-bold text-lg" style={{ color: '#1E3A8A' }}>MedLink System</p>
                      <p className="text-sm" style={{ color: '#6B7280' }}>Manages & Tracks</p>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2563EB', opacity: 0.1 }}>
                      <span className="text-xs font-bold" style={{ color: '#2563EB' }}>2</span>
                    </div>
                  </div>

                  {/* Animated Arrow */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-1 h-16 animate-pulse" style={{ backgroundColor: '#2563EB' }}></div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1" style={{ backgroundColor: '#2563EB' }}></div>
                      <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-t-4 border-b-4 border-transparent" style={{ borderLeftColor: '#2563EB' }}></div>
                    </div>
                  </div>

                  {/* Hospital Card */}
                  <div className="flex items-center space-x-4 p-5 rounded-xl transform hover:scale-105 transition-transform" style={{ backgroundColor: '#ECFDF5', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1)' }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl shadow-lg" style={{ backgroundColor: '#10B981' }}>
                      🏥
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg" style={{ color: '#1E3A8A' }}>Hospital</p>
                      <p className="text-sm" style={{ color: '#6B7280' }}>Receives & Processes</p>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981', opacity: 0.1 }}>
                      <span className="text-xs font-bold" style={{ color: '#10B981' }}>✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ backgroundColor: '#2563EB', animationDelay: '0.5s', animationDuration: '3s' }}>
                <span className="text-3xl">🔐</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ backgroundColor: '#0D9488', animationDelay: '1s', animationDuration: '2.5s' }}>
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

