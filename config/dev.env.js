const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: '"http://2e2d1a08-4238-4165-9703-5f6a955fb6df.node.dockerapp.io:8003"',
  chatHost: '"ws://2e2d1a08-4238-4165-9703-5f6a955fb6df.node.dockerapp.io:8003"',
  decode_key: '"bQeShVmYq3t6w9z8C&FxJDNcRfUjWnZr"',
  ghost: '"https://api.h9339.com"'
})
