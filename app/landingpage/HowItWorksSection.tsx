export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20" style={{ backgroundColor: '#F3F4F6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#374151' }}>
            How It Works
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#374151' }}>
            Simple, secure, and efficient referral management
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4" style={{ backgroundColor: '#2563EB' }}>
                1
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>Doctor Creates Referral</h3>
              <p style={{ color: '#374151' }}>Healthcare provider creates a digital referral with patient information</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4" style={{ backgroundColor: '#2563EB' }}>
                2
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>Board Reviews</h3>
              <p style={{ color: '#374151' }}>Liaison officer reviews the referral and approves</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4" style={{ backgroundColor: '#10B981' }}>
                3
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>Receiving Facility Accepts</h3>
              <p style={{ color: '#374151' }}>Receiving hospital verifies and accepts the referral</p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4" style={{ backgroundColor: '#10B981' }}>
                4
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>Referral Completed</h3>
              <p style={{ color: '#374151' }}>All parties can track the referral status in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

