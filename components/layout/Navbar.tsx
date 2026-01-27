import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Name */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
              <span className="text-white text-xl font-bold">🏥</span>
            </div>
            <Link href="/" className="text-2xl font-bold transition-colors text-slate-900 hover:text-blue-600">
              MedLink
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#home" className="font-medium transition-colors text-slate-900 hover:text-blue-600">
              Home
            </Link>
            <Link href="#features" className="font-medium transition-colors text-slate-900 hover:text-blue-600">
              Features
            </Link>
            <Link href="#how-it-works" className="font-medium transition-colors text-slate-900 hover:text-blue-600">
              How it Works
            </Link>
            <Link href="#about" className="font-medium transition-colors text-slate-900 hover:text-blue-600">
              About
            </Link>
            <Link href="#contact" className="font-medium transition-colors text-slate-900 hover:text-blue-600">
              Contact
            </Link>
          </div>

          {/* Action Button */}
          <div className="flex items-center">
            <Link
              href="/login"
              className="px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:bg-blue-700 bg-blue-600 text-white"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}