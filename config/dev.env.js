const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: '"http://2e2d1a08-4238-4165-9703-5f6a955fb6df.node.dockerapp.io:8005"',
  chatHost: '"ws://2e2d1a08-4238-4165-9703-5f6a955fb6df.node.dockerapp.io:8005"',
  decode_key: '"61Q3hC6jEvfQrwQvMd80fPm2XEqDPJhB"',
  ghost: '"http://a546542.eastasia.cloudapp.azure.com:8000"'
})
