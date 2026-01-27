export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-sm font-medium text-blue-700">Core Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            Everything You Need for Healthcare Excellence
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed specifically for modern healthcare referral management
          </p>
        </div>

        {/* Clean Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Secure Patient Management */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Secure Patient Management
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Advanced patient data protection with unique IDs and HIPAA-compliant security measures
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Unique patient identification</li>
              <li>• End-to-end encryption</li>
              <li>• Audit trail tracking</li>
            </ul>
          </div>

          {/* Feature 2: Smart Referral Tracking */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Smart Referral Tracking
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Real-time tracking from creation to completion with intelligent status updates
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Real-time status updates</li>
              <li>• Automated notifications</li>
              <li>• Performance analytics</li>
            </ul>
          </div>

          {/* Feature 3: Approval & QR Verification */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Approval & QR Verification
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Streamlined approval workflow with secure QR code verification for instant access
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Multi-level approvals</li>
              <li>• QR code verification</li>
              <li>• Digital signatures</li>
            </ul>
          </div>

          {/* Feature 4: Dashboard Insights */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Dashboard Insights
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Advanced analytics and reporting for doctors and administrators with real-time data
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Real-time analytics</li>
              <li>• Custom reports</li>
              <li>• Performance metrics</li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
            Explore All Features
          </button>
        </div>
      </div>
    </section>
  );
}

