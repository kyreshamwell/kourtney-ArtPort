import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Name/Logo on the left */}
          <div className="flex-shrink-0">
            <a href="#home" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Kourtney Shamwell
            </a>
          </div>

          {/* Navigation links on the right */}
          <div className="flex space-x-8">
            <a
              href="#home"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              About
            </a>
            <a
              href="#gallery"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Gallery
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}
