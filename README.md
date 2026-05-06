# File Renamer

File Renamer is a Next.js web app that lets you select multiple files in the browser and download new copies with sequential names such as `base-name1.ext`, `base-name2.ext`, and so on. Files are never uploaded to a server; all processing happens in the user's browser memory.

## Features

- Add multiple files with drag and drop or the file picker
- Preview new filenames in real time after entering a base name
- Preserve each file's original extension
- Remove individual files or clear the full list
- Show the selected file count and total size
- Download locally with browser `Blob URL` objects and the `download` attribute

## Running Locally

```bash
npm install
npm run dev
```

After the development server starts, open `http://localhost:3000` in your browser.
If port 3000 is already in use, Next.js will automatically choose another available port.

## Build

```bash
npm run build
npm run start
```

## Project Structure

```text
.
├── app
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── file-renamer.jsx
├── next.config.mjs
├── package.json
├── package-lock.json
├── README.md
└── research.md
```

`file-renamer.jsx` is kept as the original implementation file. The active Next.js app UI and logic live in `app/page.jsx` and `app/globals.css`.

## Tech Stack

- Next.js 16.2.4
- React 19.2.5
- App Router
- Client Component
- HTML File API
- Blob URL API
