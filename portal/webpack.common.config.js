const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: {
    main: './scripts/main.ts',
    govukFrontend: './scripts/govuk-frontend.js',
    mojFrontend: './scripts/moj-frontend.js',
    maskedInputs: './scripts/masked-inputs.js',
    jsEnabled: './scripts/js-enabled.js',
    multiFileUpload: './scripts/multi-file-upload.js',
    ukefexposure: './scripts/ukef-exposure.js',
    guaranteeFeePayableByBank: './scripts/guarantee-fee-payable-by-bank.js',
    printPage: './scripts/print-page.js',
    mojFilters: './scripts/moj-filters.js',
  },
  output: {
    path: path.join(__dirname, 'public/js'),
    filename: '[name].js',
    library: ['DTFS_PORTAL', '[name]'],
    libraryTarget: 'var',
  },
  target: ['web', 'es5'],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(s*)css$/,
        use: [
          {
            loader: 'file-loader',
            options: { outputPath: '../css', name: 'styles.css' },
          },
          'sass-loader',
        ],
      },
    ],
  },
};
