import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Allow larger uploads since we'll compress them automatically
    // Maximum 100MB before compression (very generous for initial upload)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 100MB. The image will be automatically optimized after upload.' }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Upload image first without watermark, then get the URL with watermark applied via transformation
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'gallery',
      quality: 'auto:good',
      width: 2500,
      height: 2500,
      crop: 'limit',
    })

    // Two vertical watermarks - left and center - going up and down
    const watermarkedUrl = cloudinary.url(result.public_id, {
      secure: true,
      transformation: [
        // Left vertical watermark
        {
          overlay: {
            font_family: 'Arial',
            font_size: 60,
            font_weight: 'bold',
            text: 'Kourtney%20Shamwell'
          },
          color: 'white',
          opacity: 50,
          gravity: 'west',
          angle: -90, // Vertical
          x: 100
        },
        // Center vertical watermark
        {
          overlay: {
            font_family: 'Arial',
            font_size: 60,
            font_weight: 'bold',
            text: 'Kourtney%20Shamwell'
          },
          color: 'white',
          opacity: 50,
          gravity: 'center',
          angle: -90 // Vertical
        },
      ],
    })

    console.log('Generated watermarked URL:', watermarkedUrl)

    return NextResponse.json({
      success: true,
      url: watermarkedUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
