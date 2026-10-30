import test, { afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import db from '../src/db/database';
import router from '../src/routes/videos';
import { createGenerationTask, completeTask, cleanupTimers, getProgress } from '../src/services/videoService';
const loadTypescript = require('../../tests/helpers/load-typescript.cjs');

// afterEach wipes three tables; refuse to run against anything but the in-memory DB set by `npm test`.
if (process.env.DB_PATH !== ':memory:') throw new Error('video tests require DB_PATH=:memory: (run `npm test`)');

afterEach(() => { cleanupTimers(); db.exec('DELETE FROM generation_tasks; DELETE FROM video_projects; DELETE FROM users;'); });
after(() => db.close());
function fixture(credits = 0) {
  db.prepare('INSERT INTO users (id, phone, password_hash, credits) VALUES (?, ?, ?, ?)').run('owner', 'fixture-owner', 'unused', credits);
  db.prepare('INSERT INTO video_projects (id, user_id, original_prompt) VALUES (?, ?, ?)').run('project', 'owner', 'fixture prompt');
}
test('demo generation is identified and consumes no credits even with zero balance', () => {
  fixture();
  const result = createGenerationTask('project', 'owner');
  assert.equal(result.generationMode, 'demo');
  assert.equal(result.creditsCharged, 0);
  assert.equal((db.prepare('SELECT credits FROM users').get() as {credits: number}).credits, 0);
  assert.equal(getProgress('project')?.generationMode, 'demo');
});
test('duplicate generation and wrong ownership create no extra tasks', () => {
  fixture(3);
  assert.throws(() => createGenerationTask('project', 'other'), /PROJECT_NOT_FOUND/);
  createGenerationTask('project', 'owner');
  assert.throws(() => createGenerationTask('project', 'owner'), /ALREADY_PROCESSING/);
  assert.equal((db.prepare('SELECT count(*) AS n FROM generation_tasks').get() as {n: number}).n, 1);
  assert.equal((db.prepare('SELECT credits FROM users').get() as {credits: number}).credits, 3);
});
test('task insert failure rolls back project state', () => {
  fixture();
  db.exec("CREATE TRIGGER fail_insert BEFORE INSERT ON generation_tasks BEGIN SELECT RAISE(ABORT, 'fixture failure'); END");
  try {
    assert.throws(() => createGenerationTask('project', 'owner'), /fixture failure/);
    assert.equal((db.prepare('SELECT status FROM video_projects').get() as {status: string}).status, 'draft');
  } finally { db.exec('DROP TRIGGER fail_insert'); }
});
test('completion must belong to its project and cannot complete another project', () => {
  fixture();
  const {taskId} = createGenerationTask('project', 'owner');
  db.prepare('INSERT INTO video_projects (id, user_id, original_prompt) VALUES (?, ?, ?)').run('other', 'owner', 'fixture prompt');
  assert.throws(() => completeTask(taskId, 'other'), /TASK_NOT_FOUND/);
  assert.equal(getProgress('project')?.status, 'running');
});
test('completion stores an explicitly marked demo result without charging', () => {
  fixture(3);
  const {taskId} = createGenerationTask('project', 'owner');
  completeTask(taskId, 'project');
  assert.equal(getProgress('project')?.status, 'completed');
  assert.deepEqual(db.prepare('SELECT duration, thumbnail_url FROM video_projects').get(), {duration: null, thumbnail_url: null});
  assert.equal((db.prepare('SELECT credits FROM users').get() as {credits: number}).credits, 3);
});

test('project creation validates and persists edited scenes atomically', async () => {
  fixture();
  // Invoke the actual route handler after auth with a fixture identity; no socket or real token.
  const handler = router.stack.find((layer: any) => layer.route?.path === '/' && layer.route.methods.post)!.route!.stack.at(-1)!.handle;
  const create = (body: unknown) => {
    let code = 200; let payload: any;
    const res = { status: (n: number) => { code = n; return res; }, json: (data: unknown) => { payload = data; } };
    handler({ body, user: { userId: 'owner' } } as any, res as any, () => {});
    return {code, payload};
  };
  const body = { originalPrompt: 'fixture prompt', storyboards: [{ prompt: 'edited scene', duration: 7, cameraType: null, movement: 'pan' }] };
  assert.equal(create({...body, storyboards: []}).code, 400);
  assert.equal(create({...body, storyboards: [{...body.storyboards[0], duration: -1}]}).code, 400);
  for (const invalid of [
    { duration: 2.5 }, { duration: 61 }, { cameraType: 'overhead' }, { movement: 'orbit' },
  ]) {
    assert.equal(create({...body, storyboards: [{...body.storyboards[0], ...invalid}]}).code, 400);
  }
  const result = create(body);
  assert.equal(result.code, 201);
  assert.equal(result.payload.data.generationMode, 'demo');
  const scenes = db.prepare('SELECT scene_index, prompt, duration, movement FROM storyboards WHERE project_id = ?').all(result.payload.data.id);
  assert.deepEqual(scenes, [{scene_index: 1, prompt: 'edited scene', duration: 7, movement: 'pan'}]);
  db.exec("CREATE TRIGGER fail_scene BEFORE INSERT ON storyboards BEGIN SELECT RAISE(ABORT, 'fixture failure'); END");
  try {
    const before = db.prepare('SELECT count(*) AS n FROM video_projects').get();
    assert.equal(create(body).code, 500);
    assert.deepEqual(db.prepare('SELECT count(*) AS n FROM video_projects').get(), before);
  } finally { db.exec('DROP TRIGGER fail_scene'); }
});

test('mocked AI storyboards are normalized before strict project creation', async () => {
  fixture();
  const durations = [2.4, 2.5, 0, -3, 60.4, 60.6, 999, 11];
  const cameras = ['wide', 'medium', 'close-up', 'extreme-close-up', 'wide', 'wide', null, 'overhead'];
  const movements = ['static', 'pan', 'tilt', 'zoom', 'track', 'push', 'pull', 'orbit'];
  let aiCalls = 0;
  const ai = loadTypescript('server/src/services/aiService.ts', {
    '../config/env': { env: { GEMINI_API_KEY: 'fixture-only' } },
    '@google/generative-ai': { GoogleGenerativeAI: class {
      getGenerativeModel() {
        return { generateContent: async () => {
          aiCalls++;
          return { response: { text: () => JSON.stringify({
            totalDuration: 45,
            scenes: durations.map((duration, i) => ({
              index: i + 1, prompt: `fixture scene ${i + 1}`, duration,
              camera: cameras[i], movement: movements[i],
            })),
          }) } };
        } };
      }
    } },
  });
  const handler = router.stack.find((layer: any) => layer.route?.path === '/' && layer.route.methods.post)!.route!.stack.at(-1)!.handle;
  const store = loadTypescript('src/store/projectStore.ts', { '@/services/api': {
    generateStoryboard: () => ai.generateStoryboard('fixture enhanced prompt', 8),
    createProject: async (body: unknown) => {
      let code = 200; let payload: any;
      const res = { status: (n: number) => { code = n; return res; }, json: (data: unknown) => { payload = data; } };
      handler({ body, user: { userId: 'owner' } } as any, res as any, () => {});
      assert.equal(code, 201);
      return payload.data;
    },
    startGeneration: async () => ({}),
  } }).useProjectStore;
  store.getState().setOriginalPrompt('fixture original prompt');
  store.getState().setEnhancedPrompt('fixture enhanced prompt');
  const result = await store.getState().generateStoryboard();
  assert.equal(aiCalls, 1);
  assert.deepEqual(result.scenes.map((scene: any) => scene.duration), [2, 3, 1, 1, 60, 60, 60, 11]);
  assert.deepEqual(result.scenes.map((scene: any) => scene.camera), [...cameras.slice(0, -1), null]);
  assert.deepEqual(result.scenes.map((scene: any) => scene.movement), [...movements.slice(0, -1), null]);
  assert.equal(result.totalDuration, 198);
  const projectId = await store.getState().startGeneration();
  const saved = db.prepare('SELECT duration, camera_type, movement FROM storyboards WHERE project_id = ? ORDER BY scene_index').all(projectId);
  assert.deepEqual(saved, result.scenes.map((scene: any) => ({
    duration: scene.duration, camera_type: scene.camera, movement: scene.movement,
  })));
});

test('latest progress wins when tasks share the same second', () => {
  fixture();
  const first = createGenerationTask('project', 'owner'); cleanupTimers(); completeTask(first.taskId, 'project');
  createGenerationTask('project', 'owner');
  db.exec("UPDATE generation_tasks SET created_at = '2026-01-01 00:00:00'");
  assert.equal(getProgress('project')?.status, 'running');
});
test('a timer database error fails the task without escaping or exposing SQL', (t) => {
  fixture(); t.mock.timers.enable({apis: ['setInterval']});
  const {taskId} = createGenerationTask('project', 'owner');
  db.exec("CREATE TRIGGER fail_tick BEFORE UPDATE ON generation_tasks WHEN NEW.status='running' BEGIN SELECT RAISE(ABORT, 'private SQL detail'); END");
  try {
    assert.doesNotThrow(() => t.mock.timers.tick(2000));
    assert.equal(getProgress('project')?.status, 'failed');
    assert.equal((db.prepare('SELECT error_message FROM generation_tasks WHERE id=?').get(taskId) as {error_message: string}).error_message, '演示任务失败');
  } finally { cleanupTimers(); db.exec('DROP TRIGGER fail_tick'); t.mock.timers.reset(); }
});
