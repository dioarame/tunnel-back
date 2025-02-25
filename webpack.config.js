const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].worker.js', // [name]을 사용하여 각 청크에 고유한 파일 이름을 부여합니다.
    libraryTarget: 'umd',
  },
  mode: 'production',
  target: 'webworker',
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      fs: false, // fs는 브라우저에서 사용 불가
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: require.resolve('url/'),
      vm: require.resolve('vm-browserify')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  performance: {
    maxAssetSize: 1024000,
    maxEntrypointSize: 1024000,
  }
};
