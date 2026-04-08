/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'api.dicebear.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'media.licdn.com',
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

module.exports = nextConfig
