// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

const httpProxy = require('http-proxy');
const proxy = httpProxy.createServer({ target: 'http://localhost:9000' });

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: '/',
  },
  plugins: ['@snowpack/plugin-postcss'],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
  routes: [
    {
      src: '/pistats',
      dest: (req, res) => {
        return proxy.web(req, res);
      },
    },
  ],
};
