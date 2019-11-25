module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { electron: require('electron/package.json').version } }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ]
};
