export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#374151' }}>
            Features
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#374151' }}>
            Everything you need for efficient healthcare referral management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1: Secure Patient Management */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4" style={{ color: '#2563EB' }}>🔒</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>Secure Patient Management</h3>
            <p style={{ color: '#374151' }}>Unique patient IDs, data protection</p>
          </div>

          {/* Feature 2: Smart Referral Tracking */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4" style={{ color: '#2563EB' }}>📊</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>Smart Referral Tracking</h3>
            <p style={{ color: '#374151' }}>Track referrals from creation to completion</p>
          </div>

          {/* Feature 3: Approval & QR Verification */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4" style={{ color: '#10B981' }}>✅</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>Approval & QR Verification</h3>
            <p style={{ color: '#374151' }}>Approve and verify referrals easily</p>
          </div>

          {/* Feature 4: Dashboard Insights */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4" style={{ color: '#2563EB' }}>📈</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>Dashboard Insights</h3>
            <p style={{ color: '#374151' }}>Analytics for doctors and admins</p>
          </div>
        </div>
      </div>
    </section>
  );
}

