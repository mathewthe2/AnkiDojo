/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: { 
    HOST: "http://127.0.0.1:5000/",
    ANKI_HOST: 'http://127.0.0.1:5008',
    PROXY: 'http://127.0.0.1:5008/p'
  },
}

module.exports = nextConfig
