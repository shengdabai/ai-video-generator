const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const load = require('./helpers/load-typescript.cjs');
const native = Object.fromEntries(['View', 'Text', 'TouchableOpacity', 'ScrollView', 'FlatList', 'SafeAreaView', 'Image'].map((name) => [name, name]));
native.StyleSheet = { create: (styles) => styles };
native.Dimensions = { get: () => ({ width: 400 }) };
function flatten(element) {
  if (!element || typeof element !== 'object') return [];
  return [element, ...[].concat(element.props?.children ?? []).flat().flatMap(flatten)];
}
function harness() {
  const state = []; let index = 0; let effect; let cleanup;
  return {
    react: { ...React, useState: (initial) => {
      const i = index++; if (!(i in state)) state[i] = initial;
      return [state[i], (value) => { state[i] = value; }];
    }, useEffect: (callback) => { effect = callback; }, useCallback: (callback) => callback },
    render: (Component) => { index = 0; return flatten(Component()); },
    effect: () => { cleanup = effect(); }, cleanup: () => cleanup?.(),
  };
}
test('preview loads the selected project, plays its URL and never claims an album save', async () => {
  const h = harness(); const alerts = []; let requested;
  const { PreviewScreen } = load('src/screens/PreviewScreen.tsx', {
    react: h.react, 'react-native': { ...native, Alert: { alert: (...args) => alerts.push(args) }, Share: {} },
    '@react-navigation/native': { useRoute: () => ({ params: { projectId: 'selected' } }) },
    'expo-av': { Video: 'Video', ResizeMode: { CONTAIN: 'contain' } },
    '@/services/api': { getProject: async (id) => { requested = id; return { title: 'selected title', videoUrl: 'https://example.invalid/demo.mp4', generationMode: 'demo' }; } },
  });
  h.render(PreviewScreen); h.effect(); await new Promise(setImmediate);
  const tree = h.render(PreviewScreen);
  assert.equal(requested, 'selected');
  assert.equal(tree.find((e) => e.type === 'Video').props.source.uri, 'https://example.invalid/demo.mp4');
  assert.ok(tree.some((e) => e.type === 'Text' && String(e.props.children).includes('演示模式')));
  const save = tree.find((e) => e.type === 'TouchableOpacity' && flatten(e).some((child) => child.props?.children === '相册保存暂未接入'));
  await save.props.onPress();
  assert.deepEqual(alerts, [['暂不可用', '相册保存尚未接入，视频未保存']]);
});
test('preview handles fetch failure and ignores a late response after unmount', async () => {
  for (const failure of [true, false]) {
    const h = harness(); let resolve; let reject;
    const { PreviewScreen } = load('src/screens/PreviewScreen.tsx', {
      react: h.react, 'react-native': { ...native, Alert: {}, Share: {} },
      '@react-navigation/native': { useRoute: () => ({ params: { projectId: 'selected' } }) },
      'expo-av': { Video: 'Video', ResizeMode: {} },
      '@/services/api': { getProject: () => new Promise((yes, no) => { resolve = yes; reject = no; }) },
    });
    h.render(PreviewScreen); h.effect();
    if (failure) reject(new Error('fixture')); else { h.cleanup(); resolve({ videoUrl: 'https://example.invalid/late.mp4' }); }
    await new Promise(setImmediate);
    const tree = h.render(PreviewScreen);
    assert.equal(tree.some((e) => e.type === 'Video'), false);
    if (failure) assert.ok(tree.some((e) => e.props?.children === '加载视频失败，请返回后重试'));
  }
});
test('works use actual store projects, refresh on focus and navigate to registered routes', () => {
  const h = harness(); const navigations = []; let loads = 0;
  const state = { projects: [{ id: 'real', title: 'real title', status: 'processing', duration: null }, { id: 'failed', title: 'failed title', status: 'failed', duration: null }], loadProjects: () => { loads++; }, loadMoreProjects: () => {}, isLoadingList: false };
  const { WorksScreen } = load('src/screens/WorksScreen.tsx', {
    react: h.react, 'react-native': native,
    '@react-navigation/native': { useNavigation: () => ({ navigate: (...args) => navigations.push(args) }), useFocusEffect: (callback) => callback() },
    '@/store/projectStore': { useProjectStore: () => state },
  });
  const list = h.render(WorksScreen).find((e) => e.type === 'FlatList');
  assert.equal(loads, 1); assert.deepEqual(list.props.data.map((p) => p.id), ['real', 'failed']);
  assert.equal(list.props.data[1].status, 'failed');
  list.props.renderItem({item: list.props.data[0]}).props.onPress();
  assert.deepEqual(navigations, [['Progress', {projectId: 'real'}]]);
});
test('home project taps navigate to Preview or Progress and refresh on focus', () => {
  const h = harness(); const navigations = []; let loads = 0;
  const { HomeScreen } = load('src/screens/HomeScreen.tsx', {
    react: h.react, 'react-native': native,
    '@react-navigation/native': { useNavigation: () => ({navigate: (...args) => navigations.push(args)}), useFocusEffect: (callback) => callback() },
    '@/components/ui/Card': {Card: 'Card'}, '@/components/ui/Button': {Button: 'Button'},
    '@/store/authStore': { useAuthStore: () => ({user: null}) },
    '@/store/projectStore': {useProjectStore: () => ({projects: [{id: 'done', title: 'done', status: 'completed', createdAt: ''}, {id: 'busy', title: 'busy', status: 'processing', createdAt: ''}], loadProjects: () => {loads++;}})},
  });
  const tree = h.render(HomeScreen);
  for (const title of ['done', 'busy']) tree.find((e) => e.type === 'Card' && flatten(e).some((child) => child.type === 'Text' && child.props.children === title)).props.onPress();
  assert.equal(loads, 1);
  assert.deepEqual(navigations, [['Preview', {projectId: 'done'}], ['Progress', {projectId: 'busy'}]]);
});
