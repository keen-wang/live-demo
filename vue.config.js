// vue.config.js
module.exports = {
    configureWebpack: {
        devServer: {
            host: '0.0.0.0',
            port: 6789,
            disableHostCheck: true,
            https: true,
            // proxy: {
            //     '/api': {
            //         target: 'https://consoledev-test.zego.im',
            //         pathRewrite: { '^/api': '' },
            //     },
            // },
        },
    }
  }
  