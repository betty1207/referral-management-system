import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg"></span>
              </div>
              <h3 className="text-xl font-semibold text-white">MOH Referral</h3>
            </div>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              A secure and fast referral management system connecting healthcare facilities across Ethiopia.
            </p>
            <p className="text-sm text-gray-400">
              Ministry of Health System Administration
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#home" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors duration-200">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-gray-300 hover:text-white transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact & Support</h4>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 mt-1"></span>
                <div>
                  <p className="text-sm text-gray-300">Email Support</p>
                  <a 
                    href="mailto:support@moh.gov.et" 
                    className="text-white hover:text-blue-400 transition-colors duration-200"
                  >
                    support@moh.gov.et
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 mt-1"></span>
                <div>
                  <p className="text-sm text-gray-300">Call Center</p>
                  <a 
                    href="tel:+251600012345" 
                    className="text-white hover:text-blue-400 transition-colors duration-200"
                  >
                    +251 6000 12345
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 mt-1"></span>
                <div>
                  <p className="text-sm text-gray-300">Location</p>
                  <p className="text-white">Addis Ababa, Ethiopia</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                 2025 MOH Referral System - Ministry of Health System Administration. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6 text-center">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
