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

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary with centered semi-transparent watermark
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'gallery',
      transformation: {
        overlay: {
          font_family: 'Arial',
          font_size: 80,
          font_weight: 'bold',
          text: '%C2%A9%20Kourtney%20Shamwell', // URL encoded "© Kourtney Shamwell"
        },
        color: 'white',
        opacity: 35,
        gravity: 'center',
      },
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
