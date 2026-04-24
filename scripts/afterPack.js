const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function stripProvenance(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      stripProvenance(fullPath);
    } else if (entry.isFile()) {
      try {
        const attrs = execSync(`xattr "${fullPath}"`, { encoding: 'utf8' }).trim();
        if (attrs.includes('com.apple.provenance') || attrs.includes('com.apple.quarantine')) {
          const stat = fs.statSync(fullPath);
          const tmp = fullPath + '.tmp';
          const data = fs.readFileSync(fullPath);
          fs.writeFileSync(tmp, data);
          fs.renameSync(tmp, fullPath);
          fs.chmodSync(fullPath, stat.mode);
        }
      } catch (e) {}
    }
  }
}

exports.default = async function (context) {
  const appOutDir = context.appOutDir;
  console.log(`Stripping provenance attributes in: ${appOutDir}`);
  try {
    execSync(`find "${appOutDir}" -name "._*" -delete`, { stdio: 'pipe' });
    execSync(`find "${appOutDir}" -name ".DS_Store" -delete`, { stdio: 'pipe' });
  } catch (e) {}
  stripProvenance(appOutDir);
  const verify = execSync(`xattr -r "${appOutDir}" 2>&1 || true`, { encoding: 'utf8' });
  if (verify.includes('com.apple.provenance')) {
    console.warn('WARNING: provenance still exists on some files');
  } else {
    console.log('All provenance attributes stripped successfully');
  }
};
