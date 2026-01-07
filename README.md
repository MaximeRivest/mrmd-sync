# mrmd-sync

Real-time sync server for collaborative markdown editing. Connects browsers to your filesystem with bidirectional sync via Yjs CRDTs.

```
Browser ←──WebSocket──→ mrmd-sync ←──→ ./docs/*.md
   │                        │
   └── Real-time collab ────┘
```

## Quick Start

```bash
# Start syncing a directory
npx mrmd-sync ./docs
```

That's it. Open `ws://localhost:4444/readme` in mrmd-editor and start editing. Changes sync to `./docs/readme.md`.

---

## Table of Contents

- [Installation](#installation)
- [CLI Usage](#cli-usage)
- [Programmatic Usage](#programmatic-usage)
- [Examples](#examples)
  - [Basic File Sync](#basic-file-sync)
  - [With Authentication](#with-authentication)
  - [Express Integration](#express-integration)
  - [Multiple Directories](#multiple-directories)
- [Configuration](#configuration)
- [HTTP Endpoints](#http-endpoints)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Security](#security)
- [Operational Notes](#operational-notes)
- [Troubleshooting](#troubleshooting)

---

## Installation

```bash
# Global install
npm install -g mrmd-sync

# Or use npx (no install)
npx mrmd-sync ./docs

# Or add to project
npm install mrmd-sync
```

---

## CLI Usage

### Basic

```bash
# Sync current directory's docs folder
mrmd-sync ./docs

# Custom port
mrmd-sync --port 8080 ./docs

# Short flag
mrmd-sync -p 8080 ./docs
```

### All Options

```bash
mrmd-sync [options] [directory]

Options:
  --port, -p <port>           WebSocket port (default: 4444)
  --debounce <ms>             Write debounce delay (default: 1000)
  --max-connections <n>       Max total connections (default: 100)
  --max-per-doc <n>           Max connections per document (default: 50)
  --max-file-size <bytes>     Max file size to sync (default: 10485760)
  --ping-interval <ms>        Heartbeat interval (default: 30000)
  --cleanup-delay <ms>        Doc cleanup after disconnect (default: 60000)
  --i-know-what-i-am-doing    Allow syncing system paths (/, /etc, /home)
  --help, -h                  Show help
```

### Example: Production Settings

```bash
mrmd-sync \
  --port 443 \
  --max-connections 500 \
  --max-per-doc 100 \
  --debounce 2000 \
  ./production-docs
```

---

## Programmatic Usage

```javascript
import { createServer } from 'mrmd-sync';

const server = createServer({
  dir: './docs',
  port: 4444,
});

// Server is now running
console.log('Sync server started');

// Graceful shutdown
process.on('SIGINT', () => {
  server.close();
});
```

---

## Examples

### Basic File Sync

The simplest setup - sync a folder:

```javascript
import { createServer } from 'mrmd-sync';

// Start server
const server = createServer({
  dir: './my-notes',
  port: 4444,
});

// That's it! Connect from browser:
// ws://localhost:4444/meeting-notes  →  ./my-notes/meeting-notes.md
// ws://localhost:4444/todo           →  ./my-notes/todo.md
// ws://localhost:4444/journal/2024   →  ./my-notes/journal/2024.md
```

**Browser side (with mrmd-editor):**

```javascript
import mrmd from 'mrmd-editor';

// Connect to sync server
const drive = mrmd.drive('ws://localhost:4444');

// Open a document
const editor = drive.open('meeting-notes', '#editor');

// Everything typed syncs automatically!
```

---

### With Authentication

Protect documents with custom auth:

```javascript
import { createServer } from 'mrmd-sync';
import jwt from 'jsonwebtoken';

const server = createServer({
  dir: './docs',
  port: 4444,

  // Auth receives the HTTP request and document name
  auth: async (req, docName) => {
    // Get token from query string: ws://localhost:4444/doc?token=xxx
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      return false; // Reject connection
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // Check document access
      if (docName.startsWith('private/') && !payload.isAdmin) {
        return false;
      }

      return true; // Allow connection
    } catch {
      return false; // Invalid token
    }
  },
});
```

**Browser side:**

```javascript
const token = await getAuthToken();
const drive = mrmd.drive(`ws://localhost:4444?token=${token}`);
```

---

### Express Integration

Run alongside an Express server:

```javascript
import express from 'express';
import { createServer } from 'mrmd-sync';

const app = express();

// Your REST API
app.get('/api/documents', (req, res) => {
  res.json({ documents: ['readme', 'notes', 'todo'] });
});

// Start Express
const httpServer = app.listen(3000);

// Start sync server on different port
const syncServer = createServer({
  dir: './docs',
  port: 4444,
  auth: async (req, docName) => {
    // Validate session cookie
    const sessionId = parseCookie(req.headers.cookie)?.session;
    return await validateSession(sessionId);
  },
});

console.log('API: http://localhost:3000');
console.log('Sync: ws://localhost:4444');
```

---

### Multiple Directories

Run multiple sync servers for different purposes:

```javascript
import { createServer } from 'mrmd-sync';

// Public docs - no auth, read-heavy
const publicDocs = createServer({
  dir: './public-docs',
  port: 4444,
  maxConnections: 200,
  maxConnectionsPerDoc: 100,
});

// Private workspace - auth required, smaller limits
const privateDocs = createServer({
  dir: './private-docs',
  port: 4445,
  maxConnections: 20,
  maxConnectionsPerDoc: 5,
  auth: async (req, docName) => {
    return checkAuth(req);
  },
});

// Team collaboration - balanced settings
const teamDocs = createServer({
  dir: './team-docs',
  port: 4446,
  maxConnections: 50,
  maxConnectionsPerDoc: 20,
  debounceMs: 500, // Faster saves for active collab
});
```

---

### Monitoring & Stats

Get real-time statistics:

```javascript
import { createServer } from 'mrmd-sync';

const server = createServer({ dir: './docs', port: 4444 });

// Check stats periodically
setInterval(() => {
  const stats = server.getStats();
  console.log(`Connections: ${stats.totalConnections}`);
  console.log(`Active docs: ${stats.totalDocs}`);

  // Per-document breakdown
  stats.docs.forEach(doc => {
    console.log(`  ${doc.name}: ${doc.connections} clients`);
  });
}, 10000);
```

**Example output:**

```
Connections: 12
Active docs: 3
  readme: 5 clients
  meeting-notes: 4 clients
  todo: 3 clients
```

---

### Custom File Handling

Access the underlying Yjs documents:

```javascript
import { createServer } from 'mrmd-sync';

const server = createServer({ dir: './docs', port: 4444 });

// Get a specific document
const doc = server.getDoc('readme');

// Access Yjs Y.Text
const content = doc.ytext.toString();
console.log('Current content:', content);

// Watch for changes
doc.ydoc.on('update', () => {
  console.log('Document updated!');
  console.log('New content:', doc.ytext.toString());
});

// Programmatically edit (syncs to all clients!)
doc.ytext.insert(0, '# Hello\n\n');
```

---

### Subdirectory Support

Organize documents in folders:

```javascript
const server = createServer({ dir: './docs', port: 4444 });

// These all work:
// ws://localhost:4444/readme        →  ./docs/readme.md
// ws://localhost:4444/notes/daily   →  ./docs/notes/daily.md
// ws://localhost:4444/2024/jan/01   →  ./docs/2024/jan/01.md
```

**Browser side:**

```javascript
const drive = mrmd.drive('ws://localhost:4444');

// Open nested documents
drive.open('notes/daily', '#editor1');
drive.open('2024/jan/01', '#editor2');
```

---

## Configuration

### Full Options Reference

```javascript
createServer({
  // === Directory & Port ===
  dir: './docs',           // Base directory for .md files
  port: 4444,              // WebSocket server port

  // === Authentication ===
  auth: async (req, docName) => {
    // req: HTTP upgrade request (has headers, url, etc.)
    // docName: requested document name
    // Return true to allow, false to reject
    return true;
  },

  // === Performance ===
  debounceMs: 1000,        // Delay before writing to disk (ms)
                           // Lower = faster saves, more disk I/O
                           // Higher = batched writes, less I/O

  // === Limits ===
  maxConnections: 100,     // Total WebSocket connections allowed
  maxConnectionsPerDoc: 50,// Connections per document
  maxMessageSize: 1048576, // Max WebSocket message (1MB)
  maxFileSize: 10485760,   // Max file size to sync (10MB)

  // === Timeouts ===
  pingIntervalMs: 30000,   // Heartbeat ping interval (30s)
                           // Detects dead connections
  docCleanupDelayMs: 60000,// Cleanup delay after last disconnect (60s)
                           // Keeps doc in memory briefly for reconnects

  // === Security ===
  dangerouslyAllowSystemPaths: false,  // Must be true for /, /etc, /home, etc.
});
```

### Recommended Settings by Use Case

**Local Development:**
```javascript
{
  dir: './docs',
  port: 4444,
  debounceMs: 500,        // Fast feedback
  docCleanupDelayMs: 5000, // Quick cleanup
}
```

**Team Collaboration:**
```javascript
{
  dir: './team-docs',
  port: 4444,
  maxConnections: 50,
  maxConnectionsPerDoc: 20,
  debounceMs: 1000,
  auth: validateTeamMember,
}
```

**Public Documentation:**
```javascript
{
  dir: './public-docs',
  port: 4444,
  maxConnections: 500,
  maxConnectionsPerDoc: 200,
  debounceMs: 2000,        // Reduce write load
  maxFileSize: 1048576,    // 1MB limit
}
```

---

## HTTP Endpoints

The sync server exposes HTTP endpoints for monitoring and health checks.

> **Note:** These endpoints are **unauthenticated** by design - they're intended for internal monitoring (load balancers, Kubernetes probes, Prometheus, etc.). If you need to protect them, put a reverse proxy in front.

### `GET /health` or `GET /healthz`

Health check for load balancers and orchestrators.

```bash
curl http://localhost:4444/health
```

```json
{
  "status": "healthy",
  "shutting_down": false
}
```

Returns `200` when healthy, `503` when shutting down.

### `GET /metrics`

Server metrics in JSON format.

```bash
curl http://localhost:4444/metrics
```

```json
{
  "uptime": 3600,
  "connections": {
    "total": 150,
    "active": 12
  },
  "messages": {
    "total": 45230,
    "bytesIn": 1048576,
    "bytesOut": 2097152
  },
  "files": {
    "saves": 89,
    "loads": 23
  },
  "errors": 0,
  "lastActivity": "2024-01-15T10:30:00.000Z"
}
```

### `GET /stats`

Detailed statistics including per-document breakdown.

```bash
curl http://localhost:4444/stats
```

```json
{
  "uptime": 3600,
  "connections": { "total": 150, "active": 12 },
  "documents": [
    { "name": "readme", "connections": 5, "path": "/docs/readme.md" },
    { "name": "notes/daily", "connections": 7, "path": "/docs/notes/daily.md" }
  ],
  "config": {
    "port": 4444,
    "dir": "/docs",
    "debounceMs": 1000,
    "maxConnections": 100,
    "maxConnectionsPerDoc": 50
  }
}
```

---

## API Reference

### `createServer(options)`

Creates and starts a sync server.

**Parameters:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dir` | `string` | `'./docs'` | Directory to sync |
| `port` | `number` | `4444` | WebSocket port |
| `auth` | `function` | `null` | Auth handler `(req, docName) => boolean \| Promise<boolean>` |
| `debounceMs` | `number` | `1000` | Write debounce delay |
| `maxConnections` | `number` | `100` | Max total connections |
| `maxConnectionsPerDoc` | `number` | `50` | Max connections per doc |
| `maxMessageSize` | `number` | `1048576` | Max message size (bytes) |
| `maxFileSize` | `number` | `10485760` | Max file size (bytes) |
| `pingIntervalMs` | `number` | `30000` | Heartbeat interval |
| `docCleanupDelayMs` | `number` | `60000` | Cleanup delay |
| `dangerouslyAllowSystemPaths` | `boolean` | `false` | Allow syncing `/`, `/etc`, `/home`, etc. |

**Returns:** `Server` object

---

### Server Object

```javascript
const server = createServer(options);
```

#### `server.getDoc(name)`

Get or create a document by name.

```javascript
const doc = server.getDoc('readme');
// doc.ydoc - Y.Doc instance
// doc.ytext - Y.Text instance
// doc.awareness - Awareness instance
// doc.conns - Set of WebSocket connections
// doc.filePath - Path to .md file
```

#### `server.getStats()`

Get current statistics.

```javascript
const stats = server.getStats();
// {
//   totalConnections: 12,
//   totalDocs: 3,
//   docs: [
//     { name: 'readme', connections: 5 },
//     { name: 'notes', connections: 7 },
//   ]
// }
```

#### `server.close()`

Gracefully shutdown the server.

```javascript
server.close();
// - Closes all WebSocket connections
// - Stops file watcher
// - Cleans up Y.Doc instances
```

#### `server.config`

Access the resolved configuration.

```javascript
console.log(server.config);
// { dir: './docs', port: 4444, debounceMs: 1000, ... }
```

#### `server.wss`

Access the underlying WebSocket server (ws library).

```javascript
server.wss.clients.forEach(client => {
  console.log('Client connected');
});
```

#### `server.docs`

Access the Map of loaded documents.

```javascript
server.docs.forEach((doc, name) => {
  console.log(`${name}: ${doc.ytext.length} chars`);
});
```

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      mrmd-sync                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Browser A ──┐                                         │
│               │     ┌──────────┐     ┌──────────────┐  │
│   Browser B ──┼────►│  Y.Doc   │◄───►│  readme.md   │  │
│               │     │  (CRDT)  │     │  (on disk)   │  │
│   Browser C ──┘     └──────────┘     └──────────────┘  │
│                           │                             │
│                     Yjs Protocol                        │
│                     - Sync updates                      │
│                     - Awareness (cursors)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Sync Flow

**Browser → File:**
1. User types in browser
2. mrmd-editor sends Yjs update via WebSocket
3. Server applies update to Y.Doc
4. Server broadcasts to other clients
5. Debounced write to `.md` file

**File → Browser:**
1. External edit (VS Code, git pull, etc.)
2. Chokidar detects file change
3. Server reads new content
4. Character-level diff computed
5. Diff applied to Y.Doc
6. Update broadcast to all browsers

### Why Yjs?

[Yjs](https://yjs.dev) is a CRDT (Conflict-free Replicated Data Type) library that:

- **Never loses data** - Concurrent edits merge automatically
- **Works offline** - Changes sync when reconnected
- **Character-level sync** - Only changed characters transmitted
- **Proven** - Used by Notion, Linear, and others

---

## Security

### System Path Protection

By default, mrmd-sync **refuses to sync system directories** like `/`, `/etc`, `/home`, `/var`, etc. This prevents accidentally exposing sensitive system files over WebSocket.

```bash
# This will be REJECTED:
mrmd-sync /
mrmd-sync /home
mrmd-sync /etc/myapp
```

```
Error: Refusing to sync dangerous system path: "/"

Syncing system directories (/, /etc, /home, etc.) can expose sensitive files
and allow remote file creation anywhere on your system.
```

### When You Actually Need System Access

If you're building a personal file server, NAS interface, or system admin tool, you can explicitly opt-in:

**CLI:**
```bash
# The flag name makes you think twice
mrmd-sync --i-know-what-i-am-doing /

# Or the longer version
mrmd-sync --dangerous-allow-system-paths /home
```

**Programmatic:**
```javascript
import { createServer } from 'mrmd-sync';

const server = createServer({
  dir: '/',
  dangerouslyAllowSystemPaths: true,  // Required for /, /etc, /home, etc.

  // STRONGLY RECOMMENDED: Add authentication!
  auth: async (req, docName) => {
    const token = getTokenFromRequest(req);
    return validateToken(token);
  },
});
```

### What's Considered Dangerous?

These paths require explicit opt-in:

| Path | Why It's Dangerous |
|------|-------------------|
| `/` | Access to entire filesystem |
| `/etc` | System configuration files |
| `/home` | All users' home directories |
| `/var` | System logs, databases |
| `/usr` | System binaries |
| `/root` | Root user's home |
| `/bin`, `/sbin` | System executables |

**Safe by default (no flag needed):**
- `/home/youruser/docs` - User-specific subdirectory
- `./docs` - Relative paths
- `/srv/myapp/data` - Application-specific paths

### Best Practices for System Access

If you enable system path access:

1. **Always use authentication**
   ```javascript
   createServer({
     dir: '/',
     dangerouslyAllowSystemPaths: true,
     auth: (req, docName) => validateUser(req),
   })
   ```

2. **Run as unprivileged user**
   ```bash
   # Don't run as root!
   sudo -u www-data mrmd-sync --i-know-what-i-am-doing /srv/files
   ```

3. **Use a reverse proxy with TLS**
   ```nginx
   location /sync {
     proxy_pass http://localhost:4444;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "upgrade";
   }
   ```

4. **Consider read-only for sensitive paths**
   ```javascript
   auth: async (req, docName) => {
     // Block writes to sensitive directories
     if (docName.startsWith('etc/') || docName.startsWith('var/')) {
       return false;
     }
     return validateUser(req);
   }
   ```

---

## Operational Notes

### Instance Locking

mrmd-sync uses a PID file (`.mrmd-sync/server.pid`) to prevent multiple instances from running on the same directory. If you try to start a second instance:

```
Error: Another mrmd-sync instance is already running on this directory.

  PID: 12345
  Port: 4444
  Started: 2024-01-15T10:30:00.000Z

Stop the other instance first, or use a different directory.
```

If a previous instance crashed without cleanup, the stale PID file is automatically detected and removed.

### Yjs Document Growth

Yjs stores operation history for undo/redo and conflict resolution. Long-running sessions with many edits will accumulate history, increasing memory usage. This is expected behavior - documents are cleaned up after clients disconnect (controlled by `docCleanupDelayMs`).

For high-traffic scenarios, consider:
- Lower `docCleanupDelayMs` to free memory faster
- Restart periodically during maintenance windows

### External File Edits

When files are edited externally (VS Code, git pull, etc.):
1. Chokidar detects the change
2. A character-level diff is computed
3. Changes are applied to the Yjs document
4. All connected clients receive the update

This is intentional - the `.md` file is the source of truth. However, simultaneous external edits and browser edits may result in merged content.

### Crash Recovery

If `persistYjsState: true` (default), Yjs snapshots are saved to `.mrmd-sync/*.yjs`. On restart:
1. Snapshot is loaded (contains recent edits)
2. File is read
3. If they differ, the file wins (it's the source of truth)

This protects against corrupt snapshots but means edits between the last file write and a crash may be lost. The `debounceMs` setting controls how quickly edits are persisted to the file.

---

## Troubleshooting

### Connection Rejected

**"Max connections reached"**
```javascript
// Increase limit
createServer({ maxConnections: 200 })
```

**"Invalid document name"**
```
// Document names must:
// - Not contain ".."
// - Not start with "/" or "\"
// - Only contain: letters, numbers, dashes, underscores, dots, slashes
//
// Valid: readme, notes/daily, 2024-01-01, my_doc
// Invalid: ../secret, /etc/passwd, doc<script>
```

**"Unauthorized"**
```javascript
// Check your auth function
auth: async (req, docName) => {
  console.log('Auth attempt:', docName, req.headers);
  // Make sure you return true for valid requests
  return true;
}
```

### File Not Syncing

**Check file path:**
```javascript
const doc = server.getDoc('readme');
console.log('File path:', doc.filePath);
// Should be: ./docs/readme.md
```

**Check file permissions:**
```bash
ls -la ./docs/
# Ensure writable
```

**Check file size:**
```javascript
// Default max is 10MB
createServer({ maxFileSize: 50 * 1024 * 1024 }) // 50MB
```

### High Memory Usage

**Reduce cleanup delay:**
```javascript
createServer({
  docCleanupDelayMs: 10000, // 10s instead of 60s
})
```

**Check for leaked connections:**
```javascript
setInterval(() => {
  const stats = server.getStats();
  console.log('Active docs:', stats.totalDocs);
  console.log('Connections:', stats.totalConnections);
}, 5000);
```

### Slow Performance

**Increase debounce for write-heavy workloads:**
```javascript
createServer({
  debounceMs: 2000, // 2 seconds
})
```

**Reduce max file size:**
```javascript
createServer({
  maxFileSize: 1024 * 1024, // 1MB
})
```

---

## License

MIT
