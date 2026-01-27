export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-sm font-medium text-blue-700">About MOH</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            About MOH Referral System
          </h2>
          <p className="text-xl font-semibold mb-8 text-gray-700">
            Connecting Healthcare Facilities, Simplifying Patient Referrals
          </p>
          <p className="text-lg max-w-3xl mx-auto leading-relaxed text-gray-600">
            A secure, intelligent healthcare referral management system designed to streamline patient transfers 
            between medical facilities across Ethiopia, improving access to specialized care.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              To revolutionize healthcare referral processes in Ethiopia through technology, ensuring every patient 
              receives timely access to the right medical care, regardless of their location or facility.
            </p>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Key Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Faster Processing</h4>
              <p className="text-gray-600 text-sm">
                Reduce referral processing time from days to hours with automated workflows
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🔒</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Data Security</h4>
              <p className="text-gray-600 text-sm">
                HIPAA-compliant security ensures patient data remains confidential and protected
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">📱</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Real-Time Updates</h4>
              <p className="text-gray-600 text-sm">
                Track referral status in real-time with instant notifications to all parties
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🤝</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Better Collaboration</h4>
              <p className="text-gray-600 text-sm">
                Improved communication between healthcare facilities for coordinated patient care
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Our Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-semibold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Healthcare Facilities Connected</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-blue-600 mb-2">10,000+</div>
              <p className="text-gray-600">Referrals Processed Successfully</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-blue-600 mb-2">99.9%</div>
              <p className="text-gray-600">System Uptime & Reliability</p>
            </div>
          </div>
        </div>

        {/* Values & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Our Values</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm">💡</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Innovation</h4>
                  <p className="text-gray-600 text-sm">
                    Continuously improving healthcare delivery through technology and process optimization
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm">🔒</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Security</h4>
                  <p className="text-gray-600 text-sm">
                    Protecting patient privacy and data integrity with the highest security standards
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm">⚡</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Efficiency</h4>
                  <p className="text-gray-600 text-sm">
                    Streamlining processes to save time and resources for healthcare providers
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm">🤝</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Collaboration</h4>
                  <p className="text-gray-600 text-sm">
                    Fostering partnerships between healthcare facilities for better patient outcomes
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Our Vision</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 leading-relaxed mb-4">
                To become the leading healthcare referral system in Ethiopia, setting the standard for 
                digital health transformation and ensuring every citizen has access to quality medical 
                care when and where they need it most.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We envision a future where healthcare boundaries are eliminated through technology, 
                enabling seamless collaboration between medical facilities and improving health outcomes 
                for all Ethiopians.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
            Learn More About Our System
          </button>
        </div>
      </div>
    </section>
  );
}
