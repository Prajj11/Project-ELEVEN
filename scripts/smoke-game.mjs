import { io } from 'socket.io-client';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://localhost:3002';
const clients = [];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const event = (socket, name, predicate = () => true, timeout = 10000) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { socket.off(name, listener); reject(new Error('Timed out: ' + name)); }, timeout);
  const listener = value => { if (predicate(value)) { clearTimeout(timer); socket.off(name, listener); resolve(value); } };
  socket.on(name, listener);
});
const ack = (socket, name, payload) => new Promise((resolve, reject) => {
  socket.timeout(10000).emit(name, payload, (error, response) => error ? reject(error) : resolve(response));
});
try {
  for (let i = 0; i < 5; i++) {
    const socket = io(url, { transports: ['websocket'], autoConnect: false });
    clients.push(socket);
    const connected = event(socket, 'connect');
    socket.connect(); await connected;
  }
  const host = clients[0];
  const roomState = event(host, 'room:state');
  assert.equal((await ack(host, 'room:create', { playerName: 'Smoke captain', isSoloPractice: false })).success, true);
  const room = await roomState;
  for (let i = 1; i < 4; i++) assert.equal((await ack(clients[i], 'room:join', { roomCode: room.roomCode, playerName: 'Smoke ' + i })).success, true);
  assert.equal((await ack(clients[4], 'room:join', { roomCode: room.roomCode, playerName: 'Overflow' })).success, false);
  console.log('PASS: create, join, four-player capacity');
  const blocked = event(host, 'room:error');
  host.emit('room:start-match');
  await blocked;
  console.log('PASS: unready squads cannot start');
  const ready = event(host, 'room:state', state => state.players.length === 4 && state.players.every(p => p.isReady));
  clients.slice(0, 4).forEach(client => client.emit('room:toggle-ready'));
  await ready;
  const started = event(host, 'match:started');
  host.emit('room:start-match');
  const assignment = await started;
  const playing = await event(host, 'match:snapshot', state => state.phase === 'PLAYING');
  assert.equal(playing.players.length, 10);
  console.log('PASS: automatic kickoff, ten-player roster');
  const paused = event(host, 'match:snapshot', state => state.phase === 'PAUSED');
  host.emit('match:toggle-pause');
  const pauseState = await paused;
  await sleep(350);
  const stillPaused = await event(host, 'match:snapshot');
  assert.equal(stillPaused.remainingSeconds, pauseState.remainingSeconds);
  const resumed = event(host, 'match:snapshot', state => state.phase === 'PLAYING');
  host.emit('match:toggle-pause');
  await resumed;
  console.log('PASS: pause freezes clock, resume restores play');
  const final = await event(host, 'match:ended', () => true, 300000);
  assert.ok(['blue', 'red', 'draw'].includes(final.winner));
  assert.equal(typeof final.stats.blue.shots, 'number');
  assert.ok(final.durationSeconds >= 179);
  console.log('PASS: full-length match completes with results', JSON.stringify({ scores: final.scores, winner: final.winner, duration: final.durationSeconds }));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  clients.forEach(client => client.disconnect());
}

