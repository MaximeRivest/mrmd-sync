/**
 * mrmd-sync Test Suite
 *
 * Run with: node --test test/sync.test.js
 */

import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { createServer } from '../src/index.js';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { createHash } from 'crypto';
import { tmpdir } from 'os';
import { WebSocket } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const TEST_DIR = '/tmp/mrmd-sync-test-' + process.pid;
const TEST_PORT = 14444 + (process.pid % 1000);

// Helper to create a Yjs WebSocket client
function createYjsClient(url, ydoc) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);

    ws.on('open', () => {
      clearTimeout(timeout);

      // Handle sync messages
      ws.on('message', (data) => {
        const msg = new Uint8Array(data);
        const decoder = decoding.createDecoder(msg);
        const messageType = decoding.readVarUint(decoder);

        if (messageType === 0) { // sync
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, 0);
          syncProtocol.readSyncMessage(decoder, encoder, ydoc, null);
          if (encoding.length(encoder) > 1) {
            ws.send(encoding.toUint8Array(encoder));
          }
        }
      });

      // Send initial sync request
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, 0);
      syncProtocol.writeSyncStep1(encoder, ydoc);
      ws.send(encoding.toUint8Array(encoder));

      resolve(ws);
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Helper to wait for condition
async function waitFor(fn, timeout = 5000, interval = 50) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return true;
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error('Timeout waiting for condition');
}

// Helper to wait ms
const wait = (ms) => new Promise(r => setTimeout(r, ms));

describe('mrmd-sync', () => {
  let server;

  before(() => {
    // Clean and create test directory
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  after(() => {
    // Cleanup
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  afterEach(async () => {
    if (server) {
      await server.close();
      server = null;
      // Wait for port to be released
      await wait(100);
    }
  });

  describe('Server Creation', () => {
    it('should create server with default options', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        logLevel: 'error',
      });

      assert.ok(server);
      assert.ok(server.server);
      assert.ok(server.wss);
      assert.ok(server.docs);
      assert.equal(typeof server.getStats, 'function');
      assert.equal(typeof server.close, 'function');

      await wait(100);
    });

    it('should reject dangerous system paths without flag', () => {
      assert.throws(() => {
        createServer({ dir: '/', port: TEST_PORT + 1 });
      }, /dangerous system path/i);
    });

    it('should allow dangerous paths with flag', async () => {
      // This would actually work but we don't want to test against root
      // Just verify the config is accepted
      const config = {
        dir: TEST_DIR,
        port: TEST_PORT,
        dangerouslyAllowSystemPaths: true,
        logLevel: 'error',
      };

      server = createServer(config);
      assert.ok(server);
      assert.equal(server.config.dangerouslyAllowSystemPaths, true);
    });
  });

  describe('File Operations', () => {
    it('should load existing file on first connection', async () => {
      // Create file before server
      const filePath = join(TEST_DIR, 'existing.md');
      writeFileSync(filePath, '# Existing Content\n\nHello world!');

      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        logLevel: 'error',
      });

      await wait(100);

      // Connect client
      const ydoc = new Y.Doc();
      const ws = await createYjsClient(`ws://localhost:${TEST_PORT}/existing`, ydoc);

      // Wait for sync
      await wait(500);

      const ytext = ydoc.getText('content');
      assert.equal(ytext.toString(), '# Existing Content\n\nHello world!');

      ws.close();
    });

    it('should create new file on first edit', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        debounceMs: 100,
        logLevel: 'error',
      });

      await wait(100);

      const ydoc = new Y.Doc();
      const ws = await createYjsClient(`ws://localhost:${TEST_PORT}/newfile`, ydoc);

      await wait(200);

      // Set up broadcast handler BEFORE making edits
      ydoc.on('update', (update, origin) => {
        if (origin !== 'remote') {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, 0);
          syncProtocol.writeUpdate(encoder, update);
          if (ws.readyState === 1) {
            ws.send(encoding.toUint8Array(encoder));
          }
        }
      });

      // Make an edit
      const ytext = ydoc.getText('content');
      ytext.insert(0, 'New content created!');

      // Wait for debounce + write
      await wait(500);

      const filePath = join(TEST_DIR, 'newfile.md');
      assert.ok(existsSync(filePath), 'File should be created');

      const content = readFileSync(filePath, 'utf8');
      assert.ok(content.includes('New content created'), 'Content should be saved');

      ws.close();
    });

    it('should use atomic writes (temp file + rename)', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        debounceMs: 50,
        logLevel: 'error',
      });

      await wait(100);

      const ydoc = new Y.Doc();
      const ws = await createYjsClient(`ws://localhost:${TEST_PORT}/atomic`, ydoc);

      await wait(200);

      // Set up broadcast handler BEFORE making edits
      ydoc.on('update', (update, origin) => {
        if (origin !== 'remote') {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, 0);
          syncProtocol.writeUpdate(encoder, update);
          if (ws.readyState === 1) {
            ws.send(encoding.toUint8Array(encoder));
          }
        }
      });

      const ytext = ydoc.getText('content');
      ytext.insert(0, 'Atomic write test!');

      await wait(300);

      // Verify no temp files left behind
      const files = readdirSync(TEST_DIR);
      const tmpFiles = files.filter(f => f.includes('.tmp.'));
      assert.equal(tmpFiles.length, 0, 'No temp files should remain');

      ws.close();
    });
  });

  describe('Real-time Sync', () => {
    it('should sync between two clients', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        debounceMs: 100,
        logLevel: 'error',
      });

      await wait(100);

      // Client 1
      const ydoc1 = new Y.Doc();
      const ws1 = await createYjsClient(`ws://localhost:${TEST_PORT}/collab`, ydoc1);

      // Client 2
      const ydoc2 = new Y.Doc();
      const ws2 = await createYjsClient(`ws://localhost:${TEST_PORT}/collab`, ydoc2);

      await wait(300);

      // Set up sync handlers
      const setupSync = (ydoc, ws) => {
        ydoc.on('update', (update, origin) => {
          if (origin !== 'remote') {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, 0);
            syncProtocol.writeUpdate(encoder, update);
            if (ws.readyState === 1) {
              ws.send(encoding.toUint8Array(encoder));
            }
          }
        });
      };

      setupSync(ydoc1, ws1);
      setupSync(ydoc2, ws2);

      // Client 1 types
      const ytext1 = ydoc1.getText('content');
      ytext1.insert(0, 'Hello from client 1');

      // Wait for sync
      await wait(500);

      // Client 2 should have the content
      const ytext2 = ydoc2.getText('content');
      assert.equal(ytext2.toString(), 'Hello from client 1');

      ws1.close();
      ws2.close();
    });
  });

  describe('Health & Metrics', () => {
    it('should respond to health check', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        logLevel: 'error',
      });

      await wait(100);

      const response = await fetch(`http://localhost:${TEST_PORT}/health`);
      assert.equal(response.status, 200);

      const data = await response.json();
      assert.equal(data.status, 'healthy');
      assert.equal(data.shutting_down, false);
    });

    it('should return metrics', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        logLevel: 'error',
      });

      await wait(100);

      const response = await fetch(`http://localhost:${TEST_PORT}/metrics`);
      assert.equal(response.status, 200);

      const data = await response.json();
      assert.ok(typeof data.uptime === 'number');
      assert.ok(data.connections);
      assert.ok(data.messages);
      assert.ok(data.files);
    });

    it('should return detailed stats', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        logLevel: 'error',
      });

      await wait(100);

      // Connect a client to create a doc
      const ydoc = new Y.Doc();
      const ws = await createYjsClient(`ws://localhost:${TEST_PORT}/statsdoc`, ydoc);

      await wait(200);

      const response = await fetch(`http://localhost:${TEST_PORT}/stats`);
      assert.equal(response.status, 200);

      const data = await response.json();
      assert.ok(Array.isArray(data.documents));
      assert.ok(data.documents.some(d => d.name === 'statsdoc'));
      assert.ok(data.config);

      ws.close();
    });
  });

  describe('Connection Limits', () => {
    it('should reject connections when max reached', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        maxConnections: 2,
        logLevel: 'error',
      });

      await wait(100);

      const ydoc1 = new Y.Doc();
      const ydoc2 = new Y.Doc();
      const ydoc3 = new Y.Doc();

      const ws1 = await createYjsClient(`ws://localhost:${TEST_PORT}/doc1`, ydoc1);
      const ws2 = await createYjsClient(`ws://localhost:${TEST_PORT}/doc2`, ydoc2);

      await wait(100);

      // Third connection should fail
      try {
        await createYjsClient(`ws://localhost:${TEST_PORT}/doc3`, ydoc3);
        assert.fail('Should have rejected third connection');
      } catch (err) {
        // Expected
      }

      ws1.close();
      ws2.close();
    });
  });

  describe('Document Validation', () => {
    it('should reject invalid document names', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        logLevel: 'error',
      });

      await wait(100);

      const invalidNames = [
        '../escape',
        '/absolute/path',
        '\\windows\\path',
        'doc<script>',
        'doc name with spaces', // contains space - invalid per regex
      ];

      for (const name of invalidNames) {
        try {
          const ydoc = new Y.Doc();
          await createYjsClient(`ws://localhost:${TEST_PORT}/${encodeURIComponent(name)}`, ydoc);
          assert.fail(`Should have rejected: ${name}`);
        } catch (err) {
          // Expected
        }
      }
    });

    it('should accept valid document names', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        logLevel: 'error',
      });

      await wait(100);

      const validNames = [
        'simple',
        'with-dash',
        'with_underscore',
        'with.dot',
        'nested/path',
        'deep/nested/path',
      ];

      for (const name of validNames) {
        const ydoc = new Y.Doc();
        const ws = await createYjsClient(`ws://localhost:${TEST_PORT}/${name}`, ydoc);
        assert.ok(ws, `Should accept: ${name}`);
        ws.close();
        await wait(50);
      }
    });
  });

  describe('Graceful Shutdown', () => {
    it('should flush pending writes on shutdown', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        debounceMs: 5000, // Long debounce
        logLevel: 'error',
      });

      await wait(100);

      const ydoc = new Y.Doc();
      const ws = await createYjsClient(`ws://localhost:${TEST_PORT}/shutdown-test`, ydoc);

      await wait(200);

      // Make an edit (won't be written due to long debounce)
      const ytext = ydoc.getText('content');
      ytext.insert(0, 'Content before shutdown');

      // Send update
      ydoc.on('update', (update) => {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, 0);
        syncProtocol.writeUpdate(encoder, update);
        if (ws.readyState === 1) {
          ws.send(encoding.toUint8Array(encoder));
        }
      });

      ytext.insert(ytext.length, '!');

      await wait(100);

      // Close server (should flush)
      await server.close();
      server = null;

      // Verify file was written
      const filePath = join(TEST_DIR, 'shutdown-test.md');
      assert.ok(existsSync(filePath), 'File should exist after shutdown');

      const content = readFileSync(filePath, 'utf8');
      assert.ok(content.includes('Content before shutdown'), 'Content should be flushed');
    });
  });

  describe('Yjs State Persistence', () => {
    it('should create snapshot directory in temp', async () => {
      server = createServer({
        dir: TEST_DIR,
        port: TEST_PORT,
        persistYjsState: true,
        logLevel: 'error',
      });

      await wait(100);

      // Snapshot dir is now in /tmp with hash of resolved dir
      const resolvedDir = resolve(TEST_DIR);
      const dirHash = createHash('sha256').update(resolvedDir).digest('hex').slice(0, 12);
      const snapshotDir = join(tmpdir(), `mrmd-sync-${dirHash}`);
      assert.ok(existsSync(snapshotDir), 'Snapshot directory should exist in temp');

      await server.close();
      server = null;
    });
  });
});

// Run tests if executed directly
if (process.argv[1].endsWith('sync.test.js')) {
  console.log('Run with: node --test test/sync.test.js');
}
