const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./helpers/load-typescript.cjs');

function mockExpoVideo() {
  const calls = { sources: [], listeners: {}, played: 0 };
  const player = { play: () => { calls.played++; } };
  const mocks = {
    'expo-video': {
      useVideoPlayer: (source, setup) => { calls.sources.push(source); setup?.(player); return player; },
      VideoView: 'VideoView',
    },
    expo: {
      useEventListener: (target, name, listener) => {
        assert.equal(target, player);
        calls.listeners[name] = listener;
      },
    },
  };
  return { calls, player, mocks };
}

test('video player renders an expo-video view with native controls, contain fit and no autoplay', () => {
  const { calls, player, mocks } = mockExpoVideo();
  const { VideoPlayer } = load('src/components/VideoPlayer.tsx', mocks);
  const style = { flex: 1 };
  const element = VideoPlayer({ uri: 'https://example.invalid/clip.mp4', style });
  assert.deepEqual(calls.sources, ['https://example.invalid/clip.mp4']);
  assert.equal(element.type, 'VideoView');
  assert.equal(element.props.player, player);
  assert.equal(element.props.style, style);
  assert.equal(element.props.nativeControls, true);
  assert.equal(element.props.contentFit, 'contain');
  assert.equal(calls.played, 0, 'expo-av did not autoplay; the wrapper must not either');
  assert.equal(player.loop, undefined, 'looping stays at the expo-video default (off)');
  assert.equal(player.muted, undefined, 'mute stays at the expo-video default (sound on)');
});

test('video player reports only the error status to onError', () => {
  const { calls, mocks } = mockExpoVideo();
  const { VideoPlayer } = load('src/components/VideoPlayer.tsx', mocks);
  const errors = [];
  VideoPlayer({ uri: 'https://example.invalid/clip.mp4', onError: (message) => errors.push(message) });
  const onStatus = calls.listeners.statusChange;
  assert.equal(typeof onStatus, 'function');
  onStatus({ status: 'loading' });
  onStatus({ status: 'readyToPlay' });
  assert.deepEqual(errors, []);
  onStatus({ status: 'error', error: { message: 'fixture decode failure' } });
  assert.deepEqual(errors, ['fixture decode failure']);
});

test('video player tolerates an error status without an onError handler', () => {
  const { calls, mocks } = mockExpoVideo();
  const { VideoPlayer } = load('src/components/VideoPlayer.tsx', mocks);
  VideoPlayer({ uri: 'https://example.invalid/clip.mp4' });
  assert.doesNotThrow(() => calls.listeners.statusChange({ status: 'error' }));
});
