"use client";

import { useCallback, useMemo, useRef, useState } from "react";

function getExtension(filename) {
  const idx = filename.lastIndexOf(".");
  if (idx === -1 || idx === 0) return "";
  return filename.slice(idx);
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function FileRenamerPage() {
  const [files, setFiles] = useState([]);
  const [baseName, setBaseName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const fileInputRef = useRef(null);

  const trimmedBaseName = baseName.trim();

  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles).map((file, index) => ({
      id: `${Date.now()}-${index}-${crypto.randomUUID()}`,
      file,
      originalName: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles((prev) => [...prev, ...fileArray]);
    setDownloaded(false);
  }, []);

  const getNewName = useCallback(
    (originalName, index) => {
      if (!trimmedBaseName) return originalName;
      return `${trimmedBaseName}${index + 1}${getExtension(originalName)}`;
    },
    [trimmedBaseName],
  );

  const totalSize = useMemo(
    () => files.reduce((sum, item) => sum + item.size, 0),
    [files],
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  const handleDownload = async () => {
    if (files.length === 0 || !trimmedBaseName) return;

    for (let index = 0; index < files.length; index += 1) {
      const item = files[index];
      const url = URL.createObjectURL(item.file);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = getNewName(item.originalName, index);
      anchor.click();
      URL.revokeObjectURL(url);

      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    setDownloaded(true);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
    setDownloaded(false);
  };

  const clearAll = () => {
    setFiles([]);
    setDownloaded(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="page-title">
        <header className="header">
          <div>
            <p className="eyebrow">Local file utility</p>
            <h1 id="page-title">File Renamer</h1>
            <p>
              Rename selected files in your browser and download fresh copies without uploading anything to a server.
            </p>
          </div>
          <div className="summary-panel" aria-label="Selected file summary">
            <span>{files.length}</span>
            <small>files</small>
          </div>
        </header>

        {downloaded && (
          <div className="success-bar" role="status">
            Download {files.length === 1 ? "request" : "requests"} for {files.length}{" "}
            {files.length === 1 ? "file" : "files"} sent.
          </div>
        )}

        <section className="tool-grid">
          <div className="panel upload-panel">
            <p className="section-label">Add files</p>
            <button
              className={`drop-zone ${dragging ? "is-dragging" : ""}`}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
            >
              <span className="drop-icon" aria-hidden="true">
                +
              </span>
              <strong>Drag files here or click to add</strong>
              <span>You can select multiple files at once.</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="visually-hidden"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
              }}
            />
          </div>

          <div className="panel settings-panel">
            <p className="section-label">Name settings</p>
            <label className="input-label" htmlFor="base-name">
              Base name
            </label>
            <div className="name-input-row">
              <input
                id="base-name"
                className="name-input"
                type="text"
                placeholder="e.g. photo, document, file"
                value={baseName}
                onChange={(event) => {
                  setBaseName(event.target.value);
                  setDownloaded(false);
                }}
              />
              <span className="preview-badge">
                {trimmedBaseName ? `${trimmedBaseName}1, ${trimmedBaseName}2 ...` : "Waiting for preview"}
              </span>
            </div>
            <div className="meta-row">
              <span>Original extensions kept</span>
              <span>{formatBytes(totalSize)}</span>
            </div>
          </div>
        </section>

        <section className="panel list-panel" aria-labelledby="file-list-title">
          <div className="panel-heading">
            <div>
              <p className="section-label">File list</p>
              <h2 id="file-list-title">Download name preview</h2>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={clearAll}
              disabled={files.length === 0}
            >
              Clear all
            </button>
          </div>

          {files.length > 0 ? (
            <div className="file-list">
              {files.map((item, index) => {
                const extension = getExtension(item.originalName);
                const newName = getNewName(item.originalName, index);

                return (
                  <article className="file-item" key={item.id}>
                    <span className="file-num">{String(index + 1).padStart(2, "0")}</span>
                    <span className="file-ext-badge">{extension ? extension.slice(1).toUpperCase() : "NO EXT"}</span>
                    <div className="file-names">
                      <p className="file-original">{item.originalName}</p>
                      <p className={`file-new ${trimmedBaseName ? "" : "is-empty"}`}>
                        {trimmedBaseName ? newName : "Enter a base name to preview the new filename."}
                      </p>
                    </div>
                    <span className="file-size">{formatBytes(item.size)}</span>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => removeFile(item.id)}
                      aria-label={`Remove ${item.originalName}`}
                    >
                      x
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No files selected yet.</div>
          )}
        </section>

        <footer className="action-bar">
          <p>
            {files.length > 0 ? (
              <>
                <strong>{files.length}</strong> {files.length === 1 ? "file" : "files"} ready
              </>
            ) : (
              "Add files to get started"
            )}
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={handleDownload}
            disabled={files.length === 0 || !trimmedBaseName}
          >
            Rename and download
          </button>
        </footer>
      </section>
    </main>
  );
}
