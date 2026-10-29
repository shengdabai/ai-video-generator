const test = require('node:test');
const assert = require('node:assert/strict');
const loadTypescript = require('./helpers/load-typescript.cjs');
const { pollGenerationProgress } = loadTypescript('src/utils/pollGenerationProgress.ts');

const flush = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function fixture(getProgress) {
  const timers = new Set(), updates = [], errors = [];
  let completed = 0;
  const stop = pollGenerationProgress('project-1', {
    getProgress,
    onProgress: (progress) => updates.push(progress),
    onCompleted: () => completed++,
    onError: (error) => errors.push(error),
    schedule: (callback, delayMs) => {
      assert.equal(delayMs, 3000);
      timers.add(callback);
      return () => timers.delete(callback);
    },
  });
  return { stop, timers, updates, errors, get completed() { return completed; },
    tick() {
      assert.equal(timers.size, 1);
      const callback = timers.values().next().value;
      timers.delete(callback);
      callback();
    },
  };
}

test('slow progress requests never overlap, and completion navigates once then stops', async () => {
  const first = deferred(), second = deferred();
  let calls = 0;
  const f = fixture((id) => {
    assert.equal(id, 'project-1');
    return ++calls === 1 ? first.promise : second.promise;
  });
  assert.equal(calls, 1);
  assert.equal(f.timers.size, 0);
  first.resolve({ status: 'running', progress: 10 });
  await flush();
  f.tick();
  assert.equal(calls, 2);
  assert.equal(f.timers.size, 0);
  second.resolve({ status: 'completed', progress: 100 });
  await flush();
  assert.equal(f.completed, 1);
  assert.equal(f.updates.length, 2);
  assert.equal(f.timers.size, 0);
  f.stop();
});

test('an already completed task stops after the immediate request', async () => {
  const f = fixture(async () => ({ status: 'completed', progress: 100 }));
  await flush();
  assert.equal(f.completed, 1);
  assert.equal(f.timers.size, 0);
});

test('a failed task updates the screen without navigating or scheduling another poll', async () => {
  const f = fixture(async () => ({ status: 'failed', progress: 30 }));
  await flush();
  assert.equal(f.updates[0].status, 'failed');
  assert.equal(f.completed, 0);
  assert.equal(f.timers.size, 0);
});

test('leaving the screen ignores late completion and cannot navigate', async () => {
  const request = deferred();
  const f = fixture(() => request.promise);
  f.stop();
  request.resolve({ status: 'completed', progress: 100 });
  await flush();
  assert.deepEqual(f.updates, []);
  assert.equal(f.completed, 0);
  assert.equal(f.timers.size, 0);
});

test('leaving the screen cancels the pending timer', async () => {
  const f = fixture(async () => ({ status: 'running', progress: 0 }));
  await flush();
  assert.equal(f.timers.size, 1);
  f.stop();
  assert.equal(f.timers.size, 0);
});

test('a transient request error retries, and a late rejection after cleanup is ignored', async () => {
  const request = deferred();
  const error = new Error('offline');
  let calls = 0;
  const f = fixture(() => ++calls === 1 ? Promise.reject(error) : request.promise);
  await flush();
  assert.deepEqual(f.errors, [error]);
  f.tick();
  f.stop();
  request.reject(new Error('late failure'));
  await flush();
  assert.deepEqual(f.errors, [error]);
  assert.equal(f.timers.size, 0);
});
