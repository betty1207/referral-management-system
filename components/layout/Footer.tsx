import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#2563EB' }}>
                <span className="text-white text-lg font-bold">🏥</span>
              </div>
              <h3 className="text-xl font-bold text-white">MedLink Referral</h3>
            </div>
            <p className="text-sm opacity-90 mb-2">
              A secure and fast referral management system connecting healthcare facilities.
            </p>
            <p className="text-sm opacity-75">
              Ministry of Health System Administration
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="opacity-90 hover:opacity-100 transition-opacity">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#contact" className="opacity-90 hover:opacity-100 transition-opacity">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm opacity-90">
              <div>
                <p className="mb-1 opacity-75">Email Support</p>
                <a 
                  href="mailto:support@medlinkhealth.gov.et" 
                  className="hover:opacity-100 transition-opacity underline"
                  style={{ color: '#FFFFFF' }}
                >
                  support@medlinkhealth.gov.et
                </a>
              </div>
              <div>
                <p className="mb-1 opacity-75">Call Center</p>
                <a 
                  href="tel:+251600012345" 
                  className="hover:opacity-100 transition-opacity underline"
                  style={{ color: '#FFFFFF' }}
                >
                  +251 6000 12345
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-opacity-20 mt-8 pt-8 text-center text-sm opacity-90" style={{ borderColor: '#FFFFFF' }}>
          <p>© 2025 MedLink Referral - Ministry of Health System Administration. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}