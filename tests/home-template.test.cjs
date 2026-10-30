const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./helpers/load-typescript.cjs');

const makeStore = () => load('src/store/projectStore.ts', { '@/services/api': {} }).useProjectStore;

function flatten(element) {
  if (!element || typeof element !== 'object') return [];
  return [element, ...[].concat(element.props?.children ?? []).flat().flatMap(flatten)];
}

test('applyTemplate starts a fresh project with the template prompt, style and aspect ratio', () => {
  const store = makeStore();
  store.setState({
    currentProject: {
      ...store.getState().currentProject,
      originalPrompt: 'old prompt',
      enhancedPrompt: 'old enhanced prompt',
      storyboards: [{ id: 'old', sceneIndex: 1, prompt: 'old', duration: 5 }],
      voiceConfig: { enabled: true, voiceId: 'v1' },
    },
    isGenerating: true,
  });

  store.getState().applyTemplate({ prompt: 'a starter prompt for the template', style: 'anime', aspectRatio: '9:16' });

  const { currentProject, isGenerating } = store.getState();
  assert.equal(currentProject.originalPrompt, 'a starter prompt for the template');
  assert.equal(currentProject.style, 'anime');
  assert.equal(currentProject.aspectRatio, '9:16');
  assert.equal(currentProject.enhancedPrompt, null);
  assert.deepEqual(currentProject.storyboards, []);
  assert.deepEqual(currentProject.voiceConfig, { enabled: false });
  assert.equal(isGenerating, false);
});

test('pressing a Home template card applies that template and opens the create screen', () => {
  const applied = [];
  const navigated = [];
  const native = Object.fromEntries(['View', 'Text', 'ScrollView', 'TouchableOpacity', 'SafeAreaView', 'Image', 'FlatList']
    .map((name) => [name, name]));
  native.StyleSheet = { create: (styles) => styles };
  const { HomeScreen, TEMPLATES } = load('src/screens/HomeScreen.tsx', {
    'react-native': native,
    '@react-navigation/native': { useNavigation: () => ({ navigate: (route) => navigated.push(route) }) },
    '@/components/ui/Card': { Card: 'Card' },
    '@/components/ui/Button': { Button: 'Button' },
    '@/store/authStore': { useAuthStore: () => ({ user: null }) },
    '@/store/projectStore': {
      useProjectStore: (selector) => {
        const state = { projects: [], resetCurrentProject: () => {}, applyTemplate: (t) => applied.push(t) };
        return selector ? selector(state) : state;
      },
    },
  });

  const cards = flatten(HomeScreen()).filter((element) => element.type === 'Card' && element.key);
  assert.equal(cards.length, TEMPLATES.length);
  for (const template of TEMPLATES) {
    assert.ok(template.prompt.length >= 10, 'the create screen requires at least 10 characters');
  }

  const product = TEMPLATES.find((template) => template.title === '产品展示');
  cards.find((card) => card.key === product.id).props.onPress();

  assert.equal(applied.length, 1);
  assert.equal(applied[0].prompt, product.prompt);
  assert.equal(applied[0].style, 'minimal');
  assert.equal(applied[0].aspectRatio, '1:1');
  assert.deepEqual(navigated, ['Create']);
});
