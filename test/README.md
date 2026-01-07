# mrmd-sync Browser Test

A simple file browser UI to test real-time collaboration.

## Quick Start

```bash
# 1. Start the sync server (from mrmd-sync directory)
#    For your home directory:
node bin/cli.js --i-know-what-i-am-doing ~

#    Or for a specific folder:
node bin/cli.js ~/Documents

# 2. Open the test page in your browser
#    Either open test/browser.html directly, or serve it:
npx serve .

# 3. Navigate to http://localhost:3000/test/browser.html
#    (or just open file:///path/to/mrmd-sync/test/browser.html)

# 4. Open the same URL in another browser/tab to test collaboration!
```

## Testing Collaboration

1. Open `browser.html` in **two or more browser windows**
2. Navigate to the same `.md` file in both
3. Type in one window - see changes appear instantly in the other!
4. Try editing from VS Code at the same time - it syncs too!

## What It Does

- **File Browser**: Browse directories and see all files
- **Markdown Editor**: Click any `.md` file to open it
- **Real-time Sync**: All changes sync via WebSocket
- **Bidirectional**: Edit in browser OR in VS Code/vim/etc.

## API Endpoints

The sync server exposes a REST API:

```
GET /api/list          - List root directory
GET /api/list/<path>   - List subdirectory
GET /api/info          - Server stats
```

Example:
```bash
curl http://localhost:4444/api/list
curl http://localhost:4444/api/list/Documents
curl http://localhost:4444/api/info
```
