const test = require('node:test');
const assert = require('node:assert/strict');
const babel = require('@babel/core');

test('the locked dependencies can transform the entry point and changed screens', () => {
  for (const filename of ['App.tsx', 'src/screens/StoryboardScreen.tsx', 'src/screens/ProgressScreen.tsx']) {
    const result = babel.transformFileSync(filename);
    assert.ok(result.code.length > 0, `${filename} must compile with the project Babel config`);
  }
});
