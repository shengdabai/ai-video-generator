const test = require('node:test');
const assert = require('node:assert/strict');
const babel = require('@babel/core');

test('the locked dependencies can transform the entry point and changed screens', () => {
  for (const filename of ['App.tsx', 'src/screens/StoryboardScreen.tsx', 'src/screens/ProgressScreen.tsx']) {
    const result = babel.transformFileSync(filename);
    assert.ok(result.code.length > 0, `${filename} must compile with the project Babel config`);
  }
});

test('NativeWind v4: className JSX compiles through the css-interop runtime', () => {
  const source = "import { View } from 'react-native';\nexport const Box = () => <View className=\"flex-1 p-4\" />;\n";
  const { code } = babel.transformSync(source, { filename: 'src/nativewind-fixture.tsx' });
  assert.match(code, /react-native-css-interop\/jsx-runtime/);
});

test('NativeWind v4: tailwind preset, content globs, metro wrapper and global.css entry are wired', () => {
  const fs = require('node:fs');
  const tailwind = require('../tailwind.config.js');
  assert.ok(tailwind.presets.includes(require('nativewind/preset')));
  assert.ok(tailwind.content.includes('./App.tsx'));
  assert.ok(tailwind.content.some((glob) => glob.startsWith('./src/**/')));
  assert.match(fs.readFileSync('global.css', 'utf8'), /@tailwind base;[\s\S]*@tailwind components;[\s\S]*@tailwind utilities;/);
  assert.match(fs.readFileSync('metro.config.js', 'utf8'), /withNativeWind\(config, \{ input: '\.\/global\.css' \}\)/);
  assert.match(fs.readFileSync('App.tsx', 'utf8'), /^import '\.\/global\.css';/);
});
