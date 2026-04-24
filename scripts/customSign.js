const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.default = async function (configuration) {
  const appPath = configuration.app;
  console.log(`Custom signing (Hardened Runtime): ${appPath}`);

  const entitlements = path.join(path.dirname(appPath), '..', '..', 'assets', 'entitlements.mac.plist');
  let entArg = '';
  if (fs.existsSync(entitlements)) {
    entArg = `--entitlements "${entitlements}"`;
    console.log(`Using entitlements: ${entitlements}`);
  }

  console.log('Cleaning extended attributes...');
  execSync(`xattr -cr "${appPath}"`, { stdio: 'pipe' });

  console.log('Signing with Hardened Runtime...');
  execSync(`codesign --sign - --force --deep --options runtime ${entArg} "${appPath}"`, { stdio: 'inherit' });

  execSync(`codesign --verify --deep "${appPath}"`, { stdio: 'inherit' });
  console.log('Custom signing completed');
};
