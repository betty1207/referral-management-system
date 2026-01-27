export default function ContactSection() {
  return (
    <section id="contact" className="py-20 relative overflow-hidden" style={{ backgroundColor: '#E6FFFA' }}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#0D9488', filter: 'blur(60px)' }}></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#2563EB', filter: 'blur(60px)' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E40AF' }}>
            Contact Us
          </h2>
          <p className="text-2xl font-semibold mb-6" style={{ color: '#374151' }}>
            Need Help? We're Here for You!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Side - Common Issues */}
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#E6FFFA' }}>
                <span className="text-2xl">❓</span>
              </div>
              <h3 className="text-xl font-bold" style={{ color: '#1E40AF' }}>Common Issues</h3>
            </div>
            <p className="mb-6" style={{ color: '#374151' }}>
              If you experience any difficulties using MedLink Referral, such as:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="mr-3 mt-1 text-xl">🔑</span>
                <span style={{ color: '#374151' }}>Forgot password or login issues</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1 text-xl">📋</span>
                <span style={{ color: '#374151' }}>Problems with creating or tracking referrals</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1 text-xl">⚠️</span>
                <span style={{ color: '#374151' }}>System errors or unexpected behavior</span>
              </li>
            </ul>
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#E6FFFA' }}>
              <p className="text-sm font-semibold" style={{ color: '#374151' }}>
                Our Ministry of Health System Administration Team is ready to assist you promptly.
              </p>
            </div>
          </div>

          {/* Right Side - Contact Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#E6FFFA' }}>
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-bold" style={{ color: '#1E40AF' }}>How to Contact Us</h3>
            </div>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="p-6 rounded-xl border-2 hover:shadow-lg transition-shadow" style={{ borderColor: '#0D9488', backgroundColor: '#F0FDFA' }}>
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-4">✉️</span>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#374151' }}>Email Support</p>
                    <a 
                      href="mailto:support@medlinkhealth.gov.et" 
                      className="text-lg font-bold hover:underline transition-all"
                      style={{ color: '#0D9488' }}
                    >
                      support@medlinkhealth.gov.et
                    </a>
                  </div>
                </div>
                <p className="text-sm mt-2" style={{ color: '#6B7280' }}>Professional and easy to remember</p>
              </div>

              {/* Call Center */}
              <div className="p-6 rounded-xl border-2 hover:shadow-lg transition-shadow" style={{ borderColor: '#2563EB', backgroundColor: '#EFF6FF' }}>
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-4">📞</span>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#374151' }}>Call Center</p>
                    <a 
                      href="tel:+251600012345" 
                      className="text-lg font-bold hover:underline transition-all"
                      style={{ color: '#2563EB' }}
                    >
                      +251 6000 12345
                    </a>
                  </div>
                </div>
                <p className="text-sm mt-2" style={{ color: '#6B7280' }}>Dedicated line for healthcare staff support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4" style={{ borderColor: '#0D9488' }}>
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0" style={{ backgroundColor: '#0D9488' }}>
                <span className="text-2xl text-white">💡</span>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2" style={{ color: '#1E40AF' }}>Tip</h4>
                <p style={{ color: '#374151' }}>
                  Please include your <strong style={{ color: '#0D9488' }}>name</strong>, <strong style={{ color: '#0D9488' }}>role</strong>, and <strong style={{ color: '#0D9488' }}>facility</strong> when contacting us so we can assist you faster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

