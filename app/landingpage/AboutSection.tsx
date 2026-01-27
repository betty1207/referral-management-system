export default function AboutSection() {
  return (
    <section id="about" className="py-20" style={{ backgroundColor: '#F3F4F6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#2563EB' }}>
            About MedLink Referral
          </h2>
          <p className="text-xl font-semibold mb-8" style={{ color: '#0D9488' }}>
            Connecting Healthcare Facilities, Simplifying Patient Referrals
          </p>
          <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: '#374151' }}>
            A secure, intelligent healthcare referral management system that streamlines communication between hospitals, clinics, and healthcare professionals.
          </p>
        </div>

        {/* Key Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2" style={{ color: '#374151' }}>Faster Processing</h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>Reduce delays in patient care</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2" style={{ color: '#374151' }}>Data Security</h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>Unique patient IDs & secure tracking</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="font-semibold mb-2" style={{ color: '#374151' }}>Real-Time Updates</h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>Track referral status instantly</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="font-semibold mb-2" style={{ color: '#374151' }}>Better Collaboration</h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>Seamless facility communication</p>
          </div>
        </div>
      </div>
    </section>
  );
}

