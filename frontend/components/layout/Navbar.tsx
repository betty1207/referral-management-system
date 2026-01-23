import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Name */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: '#2563EB' }}>
              <span className="text-white text-xl font-bold">🏥</span>
            </div>
            <Link href="/" className="text-2xl font-bold transition-colors" style={{ color: '#1E3A8A' }}>
              MedLink
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#home" className="font-medium transition-colors hover:opacity-80" style={{ color: '#1E3A8A' }}>
              Home
            </Link>
            <Link href="#features" className="font-medium transition-colors hover:opacity-80" style={{ color: '#1E3A8A' }}>
              Features
            </Link>
            <Link href="#how-it-works" className="font-medium transition-colors hover:opacity-80" style={{ color: '#1E3A8A' }}>
              How it Works
            </Link>
            <Link href="#about" className="font-medium transition-colors hover:opacity-80" style={{ color: '#1E3A8A' }}>
              About
            </Link>
            <Link href="#contact" className="font-medium transition-colors hover:opacity-80" style={{ color: '#1E3A8A' }}>
              Contact
            </Link>
          </div>

          {/* Action Button */}
          <div className="flex items-center">
            <Link
              href="/auth/login"
              className="px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:opacity-90"
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
