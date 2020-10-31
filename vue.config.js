module.exports = {

  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: process.env.VUE_APP_PORT || 80, // CHANGE YOUR PORT HERE!
    https: false,
    hotOnly: false,
  }
}
