import Link from 'next/link';

export default function HeroSection() {
  return (
    <section id="home" className="relative pt-20 pb-24 lg:py-32 overflow-hidden bg-white">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Mesh - Much Lighter */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        {/* Floating Medical Icons - Lighter */}
        <div className="absolute top-20 left-10 text-6xl opacity-5 animate-bounce" style={{animationDuration: '3s'}}>🏥</div>
        <div className="absolute top-40 right-20 text-5xl opacity-5 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>⚕️</div>
        <div className="absolute bottom-32 left-20 text-5xl opacity-5 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '2s'}}>💉</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-5 animate-bounce" style={{animationDuration: '4s', animationDelay: '1.5s'}}>🩺</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-center lg:text-left z-10">
            {/* Animated Badge - Lighter */}
            <div className="inline-flex items-center px-6 py-3 rounded-full mb-8 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
              </span>
              <span className="text-sm font-semibold text-blue-700">✨ Trusted by Healthcare Professionals</span>
            </div>

            {/* Animated Heading */}
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-slate-800 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                Streamline
              </h1>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-slate-800 animate-fade-in-up block" style={{animationDelay: '0.2s'}}>
                Healthcare
              </h2>
              <div className="block mt-2">
                <h3 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 bg-clip-text text-transparent animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                  Referrals with MOH
                </h3>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl mb-8 leading-relaxed font-medium text-slate-600 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              A secure and fast referral management system connecting healthcare facilities seamlessly.
            </p>

            {/* Enhanced Key Stats - Lighter */}
            <div className="grid grid-cols-3 gap-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg transform rotate-2 group-hover:rotate-3 transition-transform duration-300"></div>
                <div className="relative bg-white p-4 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-blue-100">
                  <div className="text-3xl font-bold mb-1 text-blue-500 group-hover:scale-110 transition-transform duration-300">500+</div>
                  <div className="text-sm text-slate-600">Healthcare Facilities</div>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg transform -rotate-2 group-hover:-rotate-3 transition-transform duration-300"></div>
                <div className="relative bg-white p-4 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-teal-100">
                  <div className="text-3xl font-bold mb-1 text-teal-500 group-hover:scale-110 transition-transform duration-300">10K+</div>
                  <div className="text-sm text-slate-600">Referrals Processed</div>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 rounded-lg transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                <div className="relative bg-white p-4 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-green-100">
                  <div className="text-3xl font-bold mb-1 text-green-500 group-hover:scale-110 transition-transform duration-300">99.9%</div>
                  <div className="text-sm text-slate-600">Uptime</div>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons - Lighter */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <Link
                href="/login"
                className="group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
              <Link
                href="#features"
                className="group relative px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-500 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Learn More
                  <span className="inline-block ml-2 group-hover:scale-110 transition-transform duration-300">📊</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
            </div>
          </div>

          {/* Right Side - Enhanced Interactive Illustration - Lighter */}
          <div className="flex justify-center lg:justify-end z-10">
            <div className="relative w-full max-w-lg">
              {/* Main Interactive Card */}
              <div className="relative group">
                {/* Glow Effect - Lighter */}
                <div className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-500 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500"></div>
                
                {/* Card Container */}
                <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-xl p-8 transform transition-all duration-500 group-hover:scale-105 border border-blue-100">
                  {/* Animated Background Pattern - Lighter */}
                  <div className="absolute inset-0 rounded-3xl opacity-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-teal-500 to-green-500"></div>
                  </div>
                  
                  <div className="relative space-y-6">
                    {/* Doctor Card - Enhanced - Lighter */}
                    <div className="group/doctor flex items-center space-x-4 p-5 rounded-xl transform transition-all duration-300 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm hover:shadow-md hover:scale-105 border border-blue-100">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl shadow-md bg-gradient-to-br from-blue-400 to-blue-500 group-hover/doctor:rotate-12 transition-transform duration-300">
                          👨‍⚕️
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-slate-800 group-hover/doctor:text-blue-600 transition-colors duration-300">Doctor</p>
                        <p className="text-sm text-slate-600">Creates Referral</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm group-hover/doctor:bg-blue-500 group-hover/doctor:text-white transition-all duration-300">
                        <span className="text-xs font-bold text-blue-500 group-hover/doctor:text-white transition-colors duration-300">1</span>
                      </div>
                    </div>

                    {/* Enhanced Animated Connection - Lighter */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-1 h-16 bg-gradient-to-b from-blue-400 to-teal-400 animate-pulse"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-teal-400 animate-pulse"></div>
                        <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-t-4 border-b-4 border-transparent border-l-blue-400 animate-pulse"></div>
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                      </div>
                    </div>

                    {/* System Card - Enhanced - Lighter */}
                    <div className="group/system flex items-center justify-center space-x-4 p-5 rounded-xl transform transition-all duration-300 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm hover:shadow-md hover:scale-105 border border-blue-100">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl shadow-md bg-gradient-to-br from-blue-400 to-blue-500 group-hover/system:rotate-12 transition-transform duration-300">
                          💻
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="font-bold text-lg text-slate-800 group-hover/system:text-blue-600 transition-colors duration-300">MOH System</p>
                        <p className="text-sm text-slate-600">Manages & Tracks</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm group-hover/system:bg-blue-500 group-hover/system:text-white transition-all duration-300">
                        <span className="text-xs font-bold text-blue-500 group-hover/system:text-white transition-colors duration-300">2</span>
                      </div>
                    </div>

                    {/* Enhanced Animated Connection - Lighter */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-1 h-16 bg-gradient-to-b from-teal-400 to-green-400 animate-pulse"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-teal-400 to-green-400 animate-pulse"></div>
                        <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-t-4 border-b-4 border-transparent border-l-teal-400 animate-pulse"></div>
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
                      </div>
                    </div>

                    {/* Hospital Card - Enhanced - Lighter */}
                    <div className="group/hospital flex items-center space-x-4 p-5 rounded-xl transform transition-all duration-300 bg-gradient-to-r from-green-50 to-green-100 shadow-sm hover:shadow-md hover:scale-105 border border-green-100">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl shadow-md bg-gradient-to-br from-green-400 to-green-500 group-hover/hospital:rotate-12 transition-transform duration-300">
                          🏥
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-slate-800 group-hover/hospital:text-green-600 transition-colors duration-300">Hospital</p>
                        <p className="text-sm text-slate-600">Receives & Processes</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm group-hover/hospital:bg-green-500 group-hover/hospital:text-white transition-all duration-300">
                        <span className="text-xs font-bold text-green-500 group-hover/hospital:text-white transition-colors duration-300">✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Floating Elements - Lighter */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full flex items-center justify-center shadow-md animate-bounce bg-gradient-to-br from-blue-400 to-blue-500 text-white" style={{animationDelay: '0.5s', animationDuration: '3s'}}>
                <span className="text-3xl">🔐</span>
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full flex items-center justify-center shadow-md animate-bounce bg-gradient-to-br from-teal-400 to-teal-500 text-white" style={{animationDelay: '1s', animationDuration: '2.5s'}}>
                <span className="text-2xl">✅</span>
              </div>
              <div className="absolute top-1/2 -left-8 w-12 h-12 rounded-full flex items-center justify-center shadow-md animate-bounce bg-gradient-to-br from-green-400 to-green-500 text-white" style={{animationDelay: '1.5s', animationDuration: '2s'}}>
                <span className="text-xl">📋</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

