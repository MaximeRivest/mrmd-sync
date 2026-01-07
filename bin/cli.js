#!/usr/bin/env node

/**
 * mrmd-sync CLI
 *
 * Usage:
 *   npx mrmd-sync ./docs
 *   npx mrmd-sync --port 4444 ./docs
 *   npx mrmd-sync --help
 */

import { createServer } from '../src/index.js';
import { resolve } from 'path';

const args = process.argv.slice(2);

// Parse args
const options = {
  dir: './docs',
  port: 4444,
  debounceMs: 1000,
  maxConnections: 100,
  maxConnectionsPerDoc: 50,
  maxFileSize: 10 * 1024 * 1024,
  pingIntervalMs: 30000,
  docCleanupDelayMs: 60000,
  dangerouslyAllowSystemPaths: false,
  logLevel: 'info',
  persistYjsState: true,
  snapshotIntervalMs: 30000,
};

function printHelp() {
  console.log(`
mrmd-sync - Production-ready sync server for mrmd

Usage:
  mrmd-sync [options] [directory]

Options:
  --port, -p <port>           WebSocket port (default: 4444)
  --debounce <ms>             Write debounce delay in ms (default: 1000)
  --max-connections <n>       Max total connections (default: 100)
  --max-per-doc <n>           Max connections per document (default: 50)
  --max-file-size <bytes>     Max file size in bytes (default: 10485760)
  --ping-interval <ms>        Ping interval in ms (default: 30000)
  --cleanup-delay <ms>        Doc cleanup delay after disconnect (default: 60000)
  --log-level <level>         Log level: debug, info, warn, error (default: info)
  --no-persist                Disable Yjs state persistence
  --snapshot-interval <ms>    Yjs snapshot interval in ms (default: 30000)
  --help, -h                  Show this help

Security:
  --i-know-what-i-am-doing    Allow syncing system paths (/, /etc, /home, etc.)
                              WARNING: This can expose sensitive system files!

Endpoints:
  /health                     Health check (for load balancers)
  /metrics                    Server metrics (JSON)
  /stats                      Detailed statistics (JSON)

Examples:
  mrmd-sync ./docs
  mrmd-sync --port 8080 ./my-notes
  mrmd-sync --max-connections 50 --debounce 500 ./docs
  mrmd-sync --log-level debug ./docs
  npx mrmd-sync ~/Documents/MyApp

  # Sync entire filesystem (DANGEROUS - requires explicit flag)
  mrmd-sync --i-know-what-i-am-doing /
`);
}

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }

  if (arg === '--port' || arg === '-p') {
    options.port = parseInt(args[++i], 10);
    if (isNaN(options.port) || options.port < 1 || options.port > 65535) {
      console.error('Error: Invalid port number');
      process.exit(1);
    }
  } else if (arg === '--debounce') {
    options.debounceMs = parseInt(args[++i], 10);
    if (isNaN(options.debounceMs) || options.debounceMs < 0) {
      console.error('Error: Invalid debounce value');
      process.exit(1);
    }
  } else if (arg === '--max-connections') {
    options.maxConnections = parseInt(args[++i], 10);
    if (isNaN(options.maxConnections) || options.maxConnections < 1) {
      console.error('Error: Invalid max-connections value');
      process.exit(1);
    }
  } else if (arg === '--max-per-doc') {
    options.maxConnectionsPerDoc = parseInt(args[++i], 10);
    if (isNaN(options.maxConnectionsPerDoc) || options.maxConnectionsPerDoc < 1) {
      console.error('Error: Invalid max-per-doc value');
      process.exit(1);
    }
  } else if (arg === '--max-file-size') {
    options.maxFileSize = parseInt(args[++i], 10);
    if (isNaN(options.maxFileSize) || options.maxFileSize < 1) {
      console.error('Error: Invalid max-file-size value');
      process.exit(1);
    }
  } else if (arg === '--ping-interval') {
    options.pingIntervalMs = parseInt(args[++i], 10);
    if (isNaN(options.pingIntervalMs) || options.pingIntervalMs < 1000) {
      console.error('Error: Invalid ping-interval value (min 1000ms)');
      process.exit(1);
    }
  } else if (arg === '--cleanup-delay') {
    options.docCleanupDelayMs = parseInt(args[++i], 10);
    if (isNaN(options.docCleanupDelayMs) || options.docCleanupDelayMs < 0) {
      console.error('Error: Invalid cleanup-delay value');
      process.exit(1);
    }
  } else if (arg === '--log-level') {
    const level = args[++i];
    if (!['debug', 'info', 'warn', 'error'].includes(level)) {
      console.error('Error: Invalid log level. Use: debug, info, warn, error');
      process.exit(1);
    }
    options.logLevel = level;
  } else if (arg === '--no-persist') {
    options.persistYjsState = false;
  } else if (arg === '--snapshot-interval') {
    options.snapshotIntervalMs = parseInt(args[++i], 10);
    if (isNaN(options.snapshotIntervalMs) || options.snapshotIntervalMs < 1000) {
      console.error('Error: Invalid snapshot-interval value (min 1000ms)');
      process.exit(1);
    }
  } else if (arg === '--i-know-what-i-am-doing' || arg === '--dangerous-allow-system-paths') {
    options.dangerouslyAllowSystemPaths = true;
  } else if (!arg.startsWith('-')) {
    options.dir = arg;
  } else {
    console.error(`Error: Unknown option "${arg}"`);
    printHelp();
    process.exit(1);
  }
}

// Resolve directory
options.dir = resolve(process.cwd(), options.dir);

// Start server (will throw if dangerous path without flag)
let server;
try {
  server = createServer(options);
} catch (err) {
  console.error('\n' + err.message);
  process.exit(1);
}

// Graceful shutdown - server handles SIGINT/SIGTERM internally
// but we need to wait for it to complete

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  try {
    await server.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err.message);
    process.exit(1);
  }
}

// Note: The server already registers SIGINT/SIGTERM handlers
// These are backups in case those don't fire
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', async (err) => {
  console.error('Uncaught exception:', err.message);
  await shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});
