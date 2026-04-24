const { execSync } = require('child_process');
const path = require('path');

exports.default = async function (configuration) {
  const appPath = configuration.app;
  console.log(`Custom signing (simple ad-hoc): ${appPath}`);

  console.log('Cleaning extended attributes...');
  execSync(`xattr -cr "${appPath}"`, { stdio: 'pipe' });

  console.log('Signing without hardened runtime...');
  execSync(`codesign --sign - --force --deep "${appPath}"`, { stdio: 'inherit' });

  execSync(`codesign --verify --deep "${appPath}"`, { stdio: 'inherit' });
  console.log('Custom signing completed');
};
