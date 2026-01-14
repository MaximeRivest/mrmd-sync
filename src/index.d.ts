/**
 * mrmd-sync TypeScript Declarations
 */

import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';

/**
 * Server configuration options
 */
export interface ServerConfig {
  /** Base directory for .md files (default: '.') */
  dir?: string;

  /** WebSocket server port (default: 4444) */
  port?: number;

  /** Authentication handler - return true to allow, false to reject */
  auth?: (req: import('http').IncomingMessage, docName: string) => boolean | Promise<boolean>;

  /** Debounce delay before writing to disk in ms (default: 1000) */
  debounceMs?: number;

  /** Maximum total WebSocket connections (default: 100) */
  maxConnections?: number;

  /** Maximum connections per document (default: 50) */
  maxConnectionsPerDoc?: number;

  /** Maximum WebSocket message size in bytes (default: 1MB) */
  maxMessageSize?: number;

  /** Heartbeat ping interval in ms (default: 30000) */
  pingIntervalMs?: number;

  /** Delay before cleaning up inactive docs in ms (default: 60000) */
  docCleanupDelayMs?: number;

  /** Maximum file size to sync in bytes (default: 10MB) */
  maxFileSize?: number;

  /** Allow syncing dangerous system paths like /, /etc, /home (default: false) */
  dangerouslyAllowSystemPaths?: boolean;

  /** Minimum log level: 'debug' | 'info' | 'warn' | 'error' (default: 'info') */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  /** Enable Yjs state persistence for crash recovery (default: true) */
  persistYjsState?: boolean;

  /** Interval for saving Yjs snapshots in ms (default: 30000) */
  snapshotIntervalMs?: number;
}

/**
 * Document instance representing a synced markdown file
 */
export interface Document {
  /** Yjs document instance */
  ydoc: Y.Doc;

  /** Yjs Text instance for the document content */
  ytext: Y.Text;

  /** Awareness instance for cursor positions etc */
  awareness: Awareness;

  /** Set of connected WebSocket clients */
  conns: Set<WebSocket>;

  /** Absolute path to the .md file */
  filePath: string;

  /** Path to Yjs snapshot file (if persistence enabled) */
  snapshotPath: string | null;

  /** Apply external file changes to Yjs document */
  applyFileChange: (content: string) => Promise<void>;

  /** Immediately flush pending writes to disk */
  flushWrite: () => Promise<void>;

  /** Schedule document cleanup after clients disconnect */
  scheduleCleanup: () => void;

  /** Cancel scheduled cleanup */
  cancelCleanup: () => void;
}

/**
 * Server statistics
 */
export interface ServerStats {
  /** Server uptime in seconds */
  uptime: number;

  /** Connection statistics */
  connections: {
    /** Total connections since server start */
    total: number;
    /** Currently active connections */
    active: number;
  };

  /** Message statistics */
  messages: {
    /** Total messages received */
    total: number;
    /** Total bytes received */
    bytesIn: number;
    /** Total bytes sent */
    bytesOut: number;
  };

  /** File operation statistics */
  files: {
    /** Total file saves */
    saves: number;
    /** Total file loads */
    loads: number;
  };

  /** Total errors encountered */
  errors: number;

  /** ISO timestamp of last activity */
  lastActivity: string;

  /** Active document statistics */
  docs: Array<{
    name: string;
    connections: number;
  }>;
}

/**
 * Logger interface
 */
export interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;
}

/**
 * Metrics collector
 */
export interface Metrics {
  /** Record a new connection */
  connectionOpened: () => void;
  /** Record a closed connection */
  connectionClosed: () => void;
  /** Record a received message */
  messageReceived: (bytes: number) => void;
  /** Record a sent message */
  messageSent: (bytes: number) => void;
  /** Record a file save */
  fileSaved: () => void;
  /** Record a file load */
  fileLoaded: () => void;
  /** Record an error */
  errorOccurred: () => void;
  /** Get current statistics */
  getStats: () => Omit<ServerStats, 'docs'>;
}

/**
 * Sync server instance
 */
export interface SyncServer {
  /** HTTP server instance */
  server: HTTPServer;

  /** WebSocket server instance */
  wss: WebSocketServer;

  /** Map of active documents by name */
  docs: Map<string, Document>;

  /** Get or create a document by name */
  getDoc: (name: string) => Document;

  /** Resolved server configuration */
  config: Required<ServerConfig>;

  /** Metrics collector instance */
  metrics: Metrics;

  /** Logger instance */
  log: Logger;

  /** Get current server statistics */
  getStats: () => ServerStats;

  /** Gracefully close the server */
  close: () => Promise<void>;
}

/**
 * Create a sync server
 *
 * @example
 * ```typescript
 * import { createServer } from 'mrmd-sync';
 *
 * const server = createServer({
 *   dir: '.',
 *   port: 4444,
 * });
 *
 * // Get stats
 * console.log(server.getStats());
 *
 * // Graceful shutdown
 * await server.close();
 * ```
 */
export function createServer(options?: ServerConfig): SyncServer;

/**
 * Default export
 */
declare const mrmdSync: {
  createServer: typeof createServer;
};

export default mrmdSync;
