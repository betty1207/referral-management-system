export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-sm font-medium text-blue-700">Contact</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help with any questions about the MOH Referral System
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Contact Methods */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h3>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">✉️</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email Support</p>
                  <a 
                    href="mailto:support@moh.gov.et" 
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    support@moh.gov.et
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Professional and easy to remember</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">📞</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Call Center</p>
                  <a 
                    href="tel:+251600012345" 
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    +251 6000 12345
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Dedicated line for healthcare staff support</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">📍</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Location</p>
                  <p className="text-gray-700">Addis Ababa, Ethiopia</p>
                  <p className="text-sm text-gray-600 mt-1">Ministry of Health Headquarters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Channels */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Support Channels</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600">💬</span>
                </div>
                <p className="font-medium text-gray-800">Live Chat</p>
                <p className="text-sm text-gray-600">Real-time assistance</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600">📚</span>
                </div>
                <p className="font-medium text-gray-800">Documentation</p>
                <p className="text-sm text-gray-600">User guides and manuals</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600">🎓</span>
                </div>
                <p className="font-medium text-gray-800">Training</p>
                <p className="text-sm text-gray-600">System training sessions</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600">🔄</span>
                </div>
                <p className="font-medium text-gray-800">System Updates</p>
                <p className="text-sm text-gray-600">Latest features and news</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-16">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">How do I create a referral?</h4>
              <p className="text-gray-600 text-sm">
                Log in to your dashboard and click "Create Referral" to start the process.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">What information is required?</h4>
              <p className="text-gray-600 text-sm">
                Patient details, medical history, and reason for referral are required.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">How long does approval take?</h4>
              <p className="text-gray-600 text-sm">
                Most referrals are processed within 24-48 hours during business days.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Can I track referral status?</h4>
              <p className="text-gray-600 text-sm">
                Yes, real-time tracking is available in your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
            Contact Support Team
          </button>
        </div>
      </div>
    </section>
  );
}

