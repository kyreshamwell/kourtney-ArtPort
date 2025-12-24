'use client'

import { useState, useEffect } from 'react'
import { supabase, type GalleryItem } from '@/lib/supabase'

export default function Home() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)

  useEffect(() => {
    fetchGalleryItems()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('gallery_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gallery_items',
        },
        () => {
          fetchGalleryItems()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setGalleryItems(data || [])

      // Get unique categories
      const uniqueCategories = Array.from(new Set(data?.map(item => item.category) || []))
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching gallery items:', error)
    }
  }

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>

      {/* HOME SECTION */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Hi, I'm <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Kourtney Shamwell
                </span>
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed">
                A senior in high school pursuing a degree in art.
              </p>
            </div>

            {/* Photo */}
            <div className="aspect-square backdrop-blur-lg bg-white/30 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <img
                src="/thePhoto.jpeg"
                alt="Kourtney Shamwell"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-5xl md:text-6xl text-gray-900 mb-8 tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>ABOUT ME</h2>
          <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
            <p>
              Passionate about creating unique artistic experiences that resonate and inspire. My work explores the intersection of traditional art forms and modern digital techniques.
            </p>
            <p>
              Currently studying art and developing my skills in various mediums including digital art, illustration, and visual design.
            </p>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-5xl md:text-6xl text-gray-900 mb-8 tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>GALLERY</h2>
          <p className="text-xl text-gray-700 mb-8">Explore a selection of my creative work</p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'backdrop-blur-lg bg-white/30 border border-white/20 text-gray-900 hover:bg-white/50'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'backdrop-blur-lg bg-white/30 border border-white/20 text-gray-900 hover:bg-white/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {filteredItems.length === 0 ? (
            <p className="text-gray-700 text-center py-12">No gallery items yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="aspect-square backdrop-blur-lg bg-white/30 rounded-xl border border-white/20 shadow-lg mb-4 group-hover:shadow-2xl group-hover:scale-105 transition-all overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-700">{item.category}</p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-5xl md:text-6xl text-gray-900 mb-8 tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>GET IN TOUCH</h2>
          <p className="text-xl text-gray-700 mb-12">Let's Connect!</p>

          {/* Contact Links */}
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:kourtney@example.com"
              className="px-6 py-3 backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg rounded-full text-gray-900 font-semibold hover:bg-white/50 transition-all"
            >
              Email
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg rounded-full text-gray-900 font-semibold hover:bg-white/50 transition-all"
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg rounded-full text-gray-900 font-semibold hover:bg-white/50 transition-all"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-10"
            >
              ×
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>
              <p className="text-lg text-gray-300">{selectedImage.category}</p>
              {selectedImage.description && (
                <p className="text-gray-400 mt-2 max-w-2xl">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
