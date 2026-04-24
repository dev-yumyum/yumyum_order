const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

exports.default = async function (context) {
  if (context.electronPlatformName !== 'darwin') return;

  const appOutDir = context.appOutDir;
  const productName = context.packager.appInfo.productName;
  const appPath = path.join(appOutDir, `${productName}.app`);

  if (!fs.existsSync(appPath)) {
    console.log('App not found, skipping afterPack');
    return;
  }

  console.log(`afterPack: Restoring original Electron binary names in ${appPath}`);

  const macosDir = path.join(appPath, 'Contents', 'MacOS');
  const renamedBin = path.join(macosDir, productName);
  const originalBin = path.join(macosDir, 'Electron');

  if (fs.existsSync(renamedBin) && !fs.existsSync(originalBin)) {
    fs.renameSync(renamedBin, originalBin);
    console.log(`  Renamed binary: "${productName}" -> "Electron"`);
  }

  const fwDir = path.join(appPath, 'Contents', 'Frameworks');
  const helperTypes = ['', ' (GPU)', ' (Plugin)', ' (Renderer)'];
  for (const suffix of helperTypes) {
    const renamedHelper = path.join(fwDir, `${productName} Helper${suffix}.app`);
    const originalHelper = path.join(fwDir, `Electron Helper${suffix}.app`);

    if (fs.existsSync(renamedHelper) && !fs.existsSync(originalHelper)) {
      fs.renameSync(renamedHelper, originalHelper);
      console.log(`  Renamed helper: "${productName} Helper${suffix}" -> "Electron Helper${suffix}"`);

      const helperMacOS = path.join(originalHelper, 'Contents', 'MacOS');
      const renamedHelperBin = path.join(helperMacOS, `${productName} Helper${suffix}`);
      const originalHelperBin = path.join(helperMacOS, `Electron Helper${suffix}`);
      if (fs.existsSync(renamedHelperBin) && !fs.existsSync(originalHelperBin)) {
        fs.renameSync(renamedHelperBin, originalHelperBin);
      }

      const helperPlist = path.join(originalHelper, 'Contents', 'Info.plist');
      if (fs.existsSync(helperPlist)) {
        try {
          execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable Electron\\ Helper${suffix}" "${helperPlist}"`, { stdio: 'pipe' });
          execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleName Electron\\ Helper${suffix}" "${helperPlist}"`, { stdio: 'pipe' });
        } catch (e) {}
      }
    }
  }

  const infoPlist = path.join(appPath, 'Contents', 'Info.plist');
  try {
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable Electron" "${infoPlist}"`, { stdio: 'pipe' });
    console.log('  Updated CFBundleExecutable -> Electron');
  } catch (e) {
    console.error('  Failed to update CFBundleExecutable:', e.message);
  }

  const asarPath = path.join(appPath, 'Contents', 'Resources', 'app.asar');
  if (fs.existsSync(asarPath)) {
    const hash = crypto.createHash('sha256').update(fs.readFileSync(asarPath)).digest('hex');
    try {
      execSync(`/usr/libexec/PlistBuddy -c "Set :ElectronAsarIntegrity:Resources/app.asar:hash ${hash}" "${infoPlist}"`, { stdio: 'pipe' });
      console.log(`  Fixed ASAR integrity hash: ${hash}`);
    } catch (e) {
      console.error('  Failed to fix ASAR hash:', e.message);
    }
  }

  try {
    execSync(`xattr -cr "${appPath}"`, { stdio: 'pipe' });
  } catch (e) {}

  console.log('afterPack: Completed');
};
