/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // unoptimized: true, // Disabled for performance
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains for admin flexibility
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all HTTP domains (use with caution in production)
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.googleapis.com https://apis.google.com https://va.vercel-scripts.com https://vercel.live https://sdk.cashfree.com https://*.cashfree.com; connect-src 'self' https://l.razorpay.com https://api.razorpay.com https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://vercel.live https://secure.token.upstash.io https://*.cashfree.com; frame-src 'self' https://api.razorpay.com https://*.firebaseapp.com https://vercel.live https://*.cashfree.com; img-src 'self' data: https://*.googleusercontent.com https://*.razorpay.com https://firebasestorage.googleapis.com https://*.cashfree.com https://i.postimg.cc https://postimg.cc https://*.postimages.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
