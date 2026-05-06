import { useState, useCallback, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .app {
    min-height: 100vh;
    background: #f5f7f8;
    color: #17201d;
    font-family: 'Sora', sans-serif;
    padding: 2rem 1.5rem;
  }

  .header {
    max-width: 720px;
    margin: 0 auto 2.5rem;
  }

  .header h1 {
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #17201d;
    margin-bottom: 0.4rem;
  }

  .header p {
    font-size: 0.875rem;
    color: #61716b;
    line-height: 1.6;
  }

  .card {
    max-width: 720px;
    margin: 0 auto 1.25rem;
    background: #ffffff;
    border: 0.5px solid #d8e0dd;
    border-radius: 14px;
    padding: 1.5rem;
  }

  .section-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #148b71;
    margin-bottom: 0.75rem;
  }

  .drop-zone {
    border: 1.5px dashed #b7c5c0;
    border-radius: 10px;
    padding: 2.5rem 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }

  .drop-zone:hover, .drop-zone.dragging {
    border-color: #148b71;
    background: #e5f6f1;
  }

  .drop-icon {
    width: 40px;
    height: 40px;
    margin: 0 auto 0.75rem;
    background: #eef3f1;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .drop-zone h3 {
    font-size: 0.9375rem;
    font-weight: 500;
    color: #1b3d34;
    margin-bottom: 0.3rem;
  }

  .drop-zone p {
    font-size: 0.8125rem;
    color: #61716b;
  }

  .name-input-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .name-input {
    flex: 1;
    background: #fbfdfc;
    border: 0.5px solid #d8e0dd;
    border-radius: 8px;
    padding: 0.625rem 0.875rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.875rem;
    color: #17201d;
    outline: none;
    transition: border-color 0.15s;
  }

  .name-input:focus {
    border-color: #148b71;
  }

  .name-input::placeholder {
    color: #9aa7a2;
  }

  .preview-badge {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: #0f705b;
    background: #e5f6f1;
    border: 0.5px solid #addfd0;
    border-radius: 6px;
    padding: 0.375rem 0.625rem;
    white-space: nowrap;
  }

  .file-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 320px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #b7c5c0 transparent;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fbfcfc;
    border: 0.5px solid #e1e8e5;
    border-radius: 8px;
    padding: 0.625rem 0.875rem;
    transition: border-color 0.15s;
  }

  .file-item:hover {
    border-color: #b7c5c0;
  }

  .file-num {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    color: #7d8c86;
    min-width: 20px;
    text-align: right;
  }

  .file-ext-badge {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 4px;
    background: #fff7e8;
    color: #946018;
    border: 0.5px solid #f4d5a0;
    white-space: nowrap;
  }

  .file-names {
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }

  .file-original {
    font-size: 0.8125rem;
    color: #7d8c86;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: line-through;
    margin-bottom: 2px;
  }

  .file-new {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: #1b3d34;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #7d8c86;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 1rem;
    line-height: 1;
    transition: color 0.15s, background 0.15s;
    flex-shrink: 0;
  }

  .remove-btn:hover {
    color: #c84843;
    background: #fff0ef;
  }

  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .count-info {
    font-size: 0.8125rem;
    color: #61716b;
  }

  .count-info span {
    color: #148b71;
    font-weight: 500;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-family: 'Sora', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
  }

  .btn-primary {
    background: #148b71;
    color: #fff;
  }

  .btn-primary:hover {
    background: #0f705b;
    transform: translateY(-1px);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    background: #d5ddda;
    color: #7c8a84;
    cursor: not-allowed;
    transform: none;
  }

  .btn-ghost {
    background: transparent;
    color: #61716b;
    border: 0.5px solid #d8e0dd;
  }

  .btn-ghost:hover {
    border-color: #b7c5c0;
    color: #17201d;
  }

  .success-bar {
    max-width: 720px;
    margin: 0 auto 1rem;
    background: #e5f6f1;
    border: 0.5px solid #addfd0;
    border-radius: 10px;
    padding: 0.875rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.875rem;
    color: #0f705b;
    animation: slideIn 0.2s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .empty-state {
    text-align: center;
    padding: 1.5rem 0;
    color: #7d8c86;
    font-size: 0.875rem;
  }

  .drag-handle {
    color: #b7c5c0;
    cursor: grab;
    font-size: 0.875rem;
    user-select: none;
  }
`;

function getExtension(filename) {
  const idx = filename.lastIndexOf(".");
  if (idx === -1 || idx === 0) return "";
  return filename.slice(idx);
}

function getBasename(filename) {
  const idx = filename.lastIndexOf(".");
  if (idx === -1 || idx === 0) return filename;
  return filename.slice(0, idx);
}

export default function FileRenamer() {
  const [files, setFiles] = useState([]);
  const [baseName, setBaseName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles).map((f, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      file: f,
      originalName: f.name,
    }));
    setFiles((prev) => [...prev, ...fileArray]);
    setDownloaded(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleFileInput = (e) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDownloaded(false);
  };

  const clearAll = () => {
    setFiles([]);
    setDownloaded(false);
  };

  const getNewName = (originalName, index) => {
    if (!baseName.trim()) return originalName;
    const ext = getExtension(originalName);
    return `${baseName.trim()}${index + 1}${ext}`;
  };

  const handleDownload = async () => {
    if (files.length === 0 || !baseName.trim()) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const newName = getNewName(f.originalName, i);
      const url = URL.createObjectURL(f.file);
      const a = document.createElement("a");
      a.href = url;
      a.download = newName;
      a.click();
      URL.revokeObjectURL(url);
      await new Promise((res) => setTimeout(res, 120));
    }

    setDownloaded(true);
  };

  const preview = baseName.trim()
    ? `${baseName.trim()}1.ext, ${baseName.trim()}2.ext ...`
    : null;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <h1>File Renamer</h1>
          <p>Add files, enter a base name, and download them as name1, name2 ... in order.</p>
        </div>

        {downloaded && (
          <div className="success-bar">
            <span>✓</span>
            <span>
              {files.length} {files.length === 1 ? "file has" : "files have"} been downloaded.
            </span>
          </div>
        )}

        <div className="card">
          <p className="section-label">Add files</p>
          <div
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-icon">📂</div>
            <h3>Drag files here or click to add</h3>
            <p>All file types supported · multiple files allowed</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className="card">
          <p className="section-label">Name settings</p>
          <div className="name-input-row">
            <input
              className="name-input"
              type="text"
              placeholder="Enter a new name, e.g. photo, document, file"
              value={baseName}
              onChange={(e) => {
                setBaseName(e.target.value);
                setDownloaded(false);
              }}
            />
            {preview && (
              <div className="preview-badge">→ {baseName.trim()}1, {baseName.trim()}2 ...</div>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="card">
            <p className="section-label">File list</p>
            <div className="file-list">
              {files.map((f, i) => {
                const ext = getExtension(f.originalName);
                const newName = getNewName(f.originalName, i);
                return (
                  <div className="file-item" key={f.id}>
                    <span className="file-num">{i + 1}</span>
                    {ext && (
                      <span className="file-ext-badge">{ext.slice(1).toUpperCase()}</span>
                    )}
                    <div className="file-names">
                      <div className="file-original">{f.originalName}</div>
                      <div className="file-new">
                        {baseName.trim() ? newName : <span style={{ color: "#8a9892" }}>No name entered</span>}
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeFile(f.id)} title="Remove">
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="card">
          <div className="footer-row">
            <span className="count-info">
              {files.length > 0 ? (
                <>
                  <span>{files.length}</span> {files.length === 1 ? "file" : "files"} ready
                </>
              ) : (
                "Add files to get started"
              )}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {files.length > 0 && (
                <button className="btn btn-ghost" onClick={clearAll}>
                  Clear all
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleDownload}
                disabled={files.length === 0 || !baseName.trim()}
              >
                ↓ Rename and download
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
