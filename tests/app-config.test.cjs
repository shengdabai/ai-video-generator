const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function assetPaths(value, found = []) {
  if (typeof value === 'string' && value.startsWith('./assets/')) found.push(value);
  else if (Array.isArray(value)) value.forEach((item) => assetPaths(item, found));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => assetPaths(item, found));
  return found;
}

function pngSize(relativePath) {
  const bytes = fs.readFileSync(path.join(root, relativePath));
  assert.ok(bytes.subarray(0, 8).equals(PNG_SIGNATURE), `${relativePath} must be a PNG file`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test('every ./assets/ file referenced in app.json exists and is a PNG (expo prebuild reads them)', () => {
  const paths = assetPaths(expo);
  assert.ok(paths.length >= 5, `expected icon, adaptive icon, splash, favicon and notification icon, got ${paths}`);
  for (const relativePath of paths) {
    assert.ok(fs.existsSync(path.join(root, relativePath)), `${relativePath} is referenced in app.json but missing`);
    pngSize(relativePath);
  }
});

test('app icon and adaptive icon are square PNGs of at least 1024px', () => {
  for (const relativePath of [expo.icon, expo.android.adaptiveIcon.foregroundImage]) {
    const { width, height } = pngSize(relativePath);
    assert.equal(width, height, `${relativePath} must be square`);
    assert.ok(width >= 1024, `${relativePath} must be at least 1024px wide`);
  }
});

test('splash screen is configured through the expo-splash-screen plugin (SDK 57 ignores the root splash key)', () => {
  assert.equal(expo.splash, undefined, 'the root "splash" key is not read by Expo SDK 57');
  const plugin = expo.plugins.find((entry) => Array.isArray(entry) && entry[0] === 'expo-splash-screen');
  assert.ok(plugin, 'expo-splash-screen config plugin is missing');
  const options = plugin[1];
  assert.equal(options.backgroundColor, '#6366F1');
  assert.ok(options.image.startsWith('./assets/'));

  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.ok(pkg.dependencies['expo-splash-screen'], 'expo-splash-screen must be a direct dependency');
});
