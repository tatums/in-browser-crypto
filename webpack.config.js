var path = require('path');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname,
    filename: "bundle.js",
    libraryTarget: 'var',
    library: ['CryptIt']
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: path.join(__dirname, 'src'),
        loaders: ['babel']
      },
      {
        test: /\.css$/,
        loader: "style!css"
      },
    ]
  }
};
