export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-sm font-medium text-blue-700">Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A simple, streamlined process for efficient healthcare referrals
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-semibold text-xl">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Doctor Creates Referral
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Healthcare providers initiate referrals through the secure MOH portal with patient information
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-semibold text-xl">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              System Processes
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Automated validation and routing to appropriate facilities based on specialization and availability
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-semibold text-xl">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Hospital Receives
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Receiving facility reviews and accepts the referral, preparing for patient arrival
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Treatment Complete
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Patient receives care and referral is marked complete with comprehensive documentation
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
            Learn More About the Process
          </button>
        </div>
      </div>
    </section>
  );
}

