'use client'

import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import { supabase, type GalleryItem } from '@/lib/supabase'

export default function AdminPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [categories, setCategories] = useState<string[]>([])

  const [newCategory, setNewCategory] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Fetch gallery items from Supabase
  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGalleryItems(data || [])

      // Get unique categories from gallery items
      const uniqueCategories = Array.from(new Set(data?.map(item => item.category) || []))
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!title || !category || !imageFile) {
      alert('Please fill in title, category, and select an image')
      return
    }

    setUploading(true)

    try {
      // Upload image to Cloudinary with watermark
      const formData = new FormData()
      formData.append('file', imageFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const { url: imageUrl } = await uploadResponse.json()

      // Insert gallery item into database with Cloudinary URL
      const { error: insertError } = await supabase
        .from('gallery_items')
        .insert([
          {
            title,
            category,
            description,
            image_url: imageUrl,
          },
        ])

      if (insertError) throw insertError

      // Reset form
      setTitle('')
      setCategory('')
      setDescription('')
      setImageFile(null)

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Refresh gallery items
      fetchGalleryItems()
      alert('Gallery item added successfully with watermark!')
    } catch (error) {
      console.error('Error adding gallery item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error adding gallery item'
      alert(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchGalleryItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting item')
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setNewCategory('')
      setShowAddCategory(false)
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(cat => cat !== categoryToRemove))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-5xl md:text-6xl text-gray-900 mb-2 tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              ADMIN DASHBOARD
            </h1>
            <p className="text-xl text-gray-700">Manage your portfolio content</p>
          </div>
          <UserButton />
        </div>

        {/* Add New Item Section */}
        <div className="backdrop-blur-lg bg-white/30 rounded-2xl p-8 border border-white/20 shadow-xl mb-8">
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-6 tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            ADD NEW GALLERY ITEM
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter project title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
              >
                <option value="">Select a category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Add New Category */}
              {!showAddCategory ? (
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
                >
                  + Add New Category
                </button>
              ) : (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 px-3 py-2 rounded-lg backdrop-blur-lg bg-white/40 border border-white/30 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategory(false)
                      setNewCategory('')
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Manage Categories */}
              {categories.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Current Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white/40 rounded-full text-sm"
                      >
                        <span>{cat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter project description"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload Photo or File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-lg backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {imageFile && (
                <p className="text-sm text-gray-700 mt-2">Selected: {imageFile.name}</p>
              )}
            </div>
            <button
              onClick={handleAddItem}
              disabled={uploading}
              className="w-full bg-gray-900/80 backdrop-blur-md text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Add to Gallery'}
            </button>
          </div>
        </div>

        {/* Current Gallery Items */}
        <div className="backdrop-blur-lg bg-white/30 rounded-2xl p-8 border border-white/20 shadow-xl">
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-6 tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            CURRENT GALLERY ITEMS
          </h2>
          {loading ? (
            <p className="text-gray-700">Loading gallery items...</p>
          ) : galleryItems.length === 0 ? (
            <p className="text-gray-700">No gallery items yet. Add your first one above!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="backdrop-blur-md bg-white/20 rounded-xl p-4 border border-white/20 hover:bg-white/30 transition-all shadow-lg">
                  <div className="aspect-square bg-gradient-to-br from-white/40 to-white/10 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-700 mb-1">Category: {item.category}</p>
                  {item.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-full backdrop-blur-md bg-red-500/80 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
