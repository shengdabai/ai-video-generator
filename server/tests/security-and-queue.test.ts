import test, { afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import express from 'express';
import db from '../src/db/database';
import authRoutes from '../src/routes/auth';
import { generateTokens, isTokenBlacklisted } from '../src/middleware/auth';
import { createGenerationTask, cleanupTimers, resumePendingTasks, completeTask } from '../src/services/videoService';

afterEach(() => { cleanupTimers(); db.exec('DELETE FROM generation_tasks; DELETE FROM video_projects; DELETE FROM users;'); });
after(() => db.close());
function fixture() {
  const id=crypto.randomUUID(), projectId=crypto.randomUUID();
  db.prepare('INSERT INTO users (id,phone,password_hash,credits) VALUES (?,?,?,3)').run(id,id,'unused-fixture');
  db.prepare('INSERT INTO video_projects (id,user_id,original_prompt) VALUES (?,?,?)').run(projectId,id,'fixture prompt');
  return {id,projectId};
}
async function withServer(run: (url: string) => Promise<void>) {
  const app=express();app.use(express.json());app.use('/auth',authRoutes);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  try { await run(`http://127.0.0.1:${(server.address() as {port:number}).port}`); }
  finally { await new Promise<void>(resolve=>server.close(()=>resolve())); }
}
test('logout revokes refresh token and rotation is single-use', async () => {
  const {id}=fixture();
  const pair=generateTokens({userId:id,phone:'fixture'});
  await withServer(async url=>{
    const post=(path:string,body:unknown,access?:string)=>fetch(url+path,{method:'POST',headers:{'content-type':'application/json',...(access?{authorization:`Bearer ${access}`}:{})},body:JSON.stringify(body)});
    assert.equal((await post('/auth/logout',{refreshToken:pair.refreshToken},pair.accessToken)).status,200);
    assert.equal((await post('/auth/refresh',{refreshToken:pair.refreshToken})).status,401);
    const fresh=generateTokens({userId:id,phone:'fixture'});
    assert.notEqual(fresh.refreshToken,pair.refreshToken);
    const response=await post('/auth/refresh',{refreshToken:fresh.refreshToken});
    assert.equal(response.status,200);
    const rotated=(await response.json()).data;
    assert.notEqual(rotated.refreshToken,fresh.refreshToken);
    assert.equal((await post('/auth/refresh',{refreshToken:fresh.refreshToken})).status,401);
    assert.equal((await post('/auth/refresh',{refreshToken:rotated.refreshToken})).status,200);
  });
});
test('failed task insert cannot consume credits or strand project', () => {
  const {id,projectId}=fixture();
  db.exec("CREATE TRIGGER fail_task BEFORE INSERT ON generation_tasks BEGIN SELECT RAISE(ABORT,'fixture insert failure'); END");
  try {
    assert.throws(()=>createGenerationTask(projectId,id),/fixture insert failure/);
    assert.equal((db.prepare('SELECT credits FROM users WHERE id=?').get(id) as {credits:number}).credits,3);
    assert.equal((db.prepare('SELECT status FROM video_projects WHERE id=?').get(projectId) as {status:string}).status,'draft');
    assert.equal((db.prepare('SELECT count(*) AS count FROM generation_tasks WHERE project_id=?').get(projectId) as {count:number}).count,0);
  }finally {db.exec('DROP TRIGGER fail_task');}
});
test('recovery resumes existing progress once without charging again', async () => {
  const {id,projectId}=fixture();createGenerationTask(projectId,id);cleanupTimers();
  db.prepare('UPDATE generation_tasks SET progress=42 WHERE project_id=?').run(projectId);
  assert.equal(resumePendingTasks(),1);assert.equal(resumePendingTasks(),0);
  await new Promise(resolve=>setTimeout(resolve,2150));
  const progress=(db.prepare('SELECT progress FROM generation_tasks WHERE project_id=?').get(projectId) as {progress:number}).progress;
  assert.ok(progress>42);
  assert.equal((db.prepare('SELECT credits FROM users WHERE id=?').get(id) as {credits:number}).credits,2);
});

test('malformed refresh cannot prevent logout of a valid access token', async () => {
  const {id}=fixture(); const pair=generateTokens({userId:id,phone:'fixture'});
  await withServer(async url=>{
    const response=await fetch(url+'/auth/logout',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${pair.accessToken}`},body:JSON.stringify({refreshToken:'invalid-fixture'})});
    assert.equal(response.status,200); assert.equal(isTokenBlacklisted(pair.accessToken),true);
  });
});
test('completion is atomic and startup repairs legacy partial completion', () => {
  const {id,projectId}=fixture(); const {taskId}=createGenerationTask(projectId,id);cleanupTimers();
  db.exec("CREATE TRIGGER fail_complete BEFORE UPDATE ON video_projects WHEN NEW.status='completed' BEGIN SELECT RAISE(ABORT,'fixture completion failure'); END");
  try {
    assert.throws(()=>completeTask(taskId,projectId),/fixture completion failure/);
    assert.equal((db.prepare('SELECT status FROM generation_tasks WHERE id=?').get(taskId) as {status:string}).status,'running');
  } finally {db.exec('DROP TRIGGER fail_complete');}
  db.prepare("UPDATE generation_tasks SET status='completed' WHERE id=?").run(taskId);
  assert.equal(resumePendingTasks(),0);
  assert.equal((db.prepare('SELECT status FROM video_projects WHERE id=?').get(projectId) as {status:string}).status,'completed');
  assert.equal((db.prepare('SELECT credits FROM users WHERE id=?').get(id) as {credits:number}).credits,2);
});
