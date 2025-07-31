/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https', // <-- A VÍRGULA QUE FALTAVA FOI ADICIONADA AQUI
        hostname: 'media.api-sports.io',
        pathname: '/football/**',
      },
    ],
  },
};

module.exports = nextConfig;