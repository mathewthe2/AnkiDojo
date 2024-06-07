/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // strict mode rerenders component twice
  swcMinify: true,
  env: {
    HOST: "http://127.0.0.1:5000/",
    ANKI_HOST: 'http://127.0.0.1:5008',
    PROXY: 'http://127.0.0.1:5008/p'
  },
  output: 'export',
}

module.exports = nextConfig
