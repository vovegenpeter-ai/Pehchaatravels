import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      // Admin "Explore Places" moved from /admin/destinations to /admin/explore-places
      { source: '/admin/destinations', destination: '/admin/explore-places', permanent: true },
      { source: '/admin/destinations/new', destination: '/admin/explore-places/new', permanent: true },
      { source: '/admin/destinations/:id', destination: '/admin/explore-places/:id', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  compress: true,
  poweredByHeader: false,
}

export default nextConfig
