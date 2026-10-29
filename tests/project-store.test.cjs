const test = require('node:test');
const assert = require('node:assert/strict');
const loadTypescript = require('./helpers/load-typescript.cjs');

const makeStore = () => loadTypescript('src/store/projectStore.ts', { '@/services/api': {} }).useProjectStore;

function scene(id, sceneIndex) {
  return { id, projectId: '', sceneIndex, prompt: id, duration: 5, status: 'pending' };
}

test('deleting a storyboard updates shared state, preserves scenes, and renumbers their order', () => {
  const store = makeStore();
  const original = [scene('first', 1), scene('middle', 2), scene('last', 3)];
  store.setState({ currentProject: { ...store.getState().currentProject, storyboards: original } });
  store.getState().deleteStoryboard(1);
  const result = store.getState().currentProject.storyboards;
  assert.deepEqual(result.map(({ id, sceneIndex }) => ({ id, sceneIndex })), [
    { id: 'first', sceneIndex: 1 }, { id: 'last', sceneIndex: 2 },
  ]);
  assert.equal(result.reduce((sum, item) => sum + item.duration, 0), 10);
  assert.equal(original.length, 3);
  assert.equal(original[2].sceneIndex, 3);
});

test('deleting the final storyboard leaves an empty list; invalid indexes do nothing', () => {
  const store = makeStore();
  store.setState({ currentProject: { ...store.getState().currentProject, storyboards: [scene('only', 1)] } });
  for (const index of [-1, 1, 0.5, NaN]) store.getState().deleteStoryboard(index);
  assert.equal(store.getState().currentProject.storyboards.length, 1);
  store.getState().deleteStoryboard(0);
  assert.deepEqual(store.getState().currentProject.storyboards, []);
});

test('the storyboard screen deletes shared state only after the confirmation action', () => {
  const store = makeStore();
  store.setState({ currentProject: { ...store.getState().currentProject, storyboards: [scene('only', 1)] } });
  let confirmation;
  const { StoryboardScreen } = loadTypescript('src/screens/StoryboardScreen.tsx', {
    'react-native': {
      View: 'View', Text: 'Text', ScrollView: 'ScrollView', TouchableOpacity: 'TouchableOpacity',
      SafeAreaView: 'SafeAreaView', StyleSheet: { create: (styles) => styles },
      Alert: { alert: (...args) => { confirmation = args; } },
    },
    '@react-navigation/native': { useNavigation: () => ({}) },
    '@/components/ui/Button': { Button: 'Button' },
    '@/components/ui/Card': { Card: 'Card' },
    '@/store/projectStore': { useProjectStore: () => store.getState() },
  });
  function flatten(element) {
    if (!element || typeof element !== 'object') return [];
    const children = [].concat(element.props?.children ?? []).flat();
    return [element, ...children.flatMap(flatten)];
  }
  const tree = flatten(StoryboardScreen());
  const deleteButton = tree.find((item) => item.type === 'TouchableOpacity' &&
    flatten(item).some((child) => child.type === 'Text' && child.props.children.includes('删除')));
  assert.ok(deleteButton, 'the screen must render a delete action');
  deleteButton.props.onPress();
  assert.equal(store.getState().currentProject.storyboards.length, 1);
  assert.equal(confirmation[0], '删除分镜');
  confirmation[2].find((action) => action.style === 'destructive').onPress();
  assert.deepEqual(store.getState().currentProject.storyboards, []);
});

test('generation sends only the edited storyboards, in their displayed order', async () => {
  let request;
  const store = loadTypescript('src/store/projectStore.ts', { '@/services/api': {
    createProject: async (body) => { request = body; return { id: 'fixture' }; },
    startGeneration: async () => ({}),
  } }).useProjectStore;
  const scenes = [scene('removed', 1), { ...scene('edited', 2), prompt: 'edited prompt', cameraType: null, movement: null }];
  store.setState({ currentProject: { ...store.getState().currentProject, storyboards: scenes } });
  store.getState().deleteStoryboard(0);
  assert.equal(await store.getState().startGeneration(), 'fixture');
  assert.deepEqual(request.storyboards, [{ prompt: 'edited prompt', duration: 5, cameraType: null, movement: null }]);
});
