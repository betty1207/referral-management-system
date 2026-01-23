export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#374151' }}>
            What Our Users Say
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#374151' }}>
            Trusted by healthcare professionals across the country
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4" style={{ borderColor: '#2563EB' }}>
            <div className="mb-4" style={{ color: '#2563EB', fontSize: '2rem' }}>"</div>
            <p className="mb-4" style={{ color: '#374151' }}>
              MedLink has revolutionized how we handle referrals. The system is intuitive and saves us hours every week.
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3" style={{ backgroundColor: '#2563EB' }}>
                DR
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#374151' }}>Dr. Sarah Johnson</p>
                <p className="text-sm" style={{ color: '#6B7280' }}>General Practitioner</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4" style={{ borderColor: '#0D9488' }}>
            <div className="mb-4" style={{ color: '#0D9488', fontSize: '2rem' }}>"</div>
            <p className="mb-4" style={{ color: '#374151' }}>
              The QR verification feature makes it so easy to verify referrals. It's fast, secure, and reliable.
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3" style={{ backgroundColor: '#0D9488' }}>
                LO
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#374151' }}>Michael Chen</p>
                <p className="text-sm" style={{ color: '#6B7280' }}>Referral Officer</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4" style={{ borderColor: '#2563EB' }}>
            <div className="mb-4" style={{ color: '#2563EB', fontSize: '2rem' }}>"</div>
            <p className="mb-4" style={{ color: '#374151' }}>
              As a hospital admin, the dashboard insights help me make better decisions about resource allocation.
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3" style={{ backgroundColor: '#2563EB' }}>
                HA
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#374151' }}>Emily Rodriguez</p>
                <p className="text-sm" style={{ color: '#6B7280' }}>Hospital Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Hospitals */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-8" style={{ color: '#374151' }}>Trusted by Leading Healthcare Facilities</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold" style={{ color: '#2563EB' }}>🏥 City General Hospital</div>
            <div className="text-2xl font-bold" style={{ color: '#2563EB' }}>🏥 Regional Medical Center</div>
            <div className="text-2xl font-bold" style={{ color: '#2563EB' }}>🏥 University Hospital</div>
            <div className="text-2xl font-bold" style={{ color: '#2563EB' }}>🏥 Community Health Clinic</div>
          </div>
        </div>
      </div>
    </section>
  );
}

