// src/shared/components/submission/PDFViewer.safari.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../../style/submission/pdf_viewer_style.css";
import { toRawUrl, toViewUrl, toDownloadUrl } from "../../../utils/pdfUrls";
import useDownloadToast from "./useDownloadToast";

// PDF.js worker (same-origin module worker)
try {
    const workerUrl = `${import.meta?.env?.BASE_URL || process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;
    const worker = new Worker(workerUrl, { type: "module" });
    pdfjs.GlobalWorkerOptions.workerPort = worker;
} catch (e) {
    console.error("[pdfjs] Worker setup failed; rendering may be slower.", e);
}

const PDFViewer = ({ pdfUrl, filename }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.1);
    const [error, setError] = useState("");
    const [fallback, setFallback] = useState(false);
    const fallbackTimerRef = useRef(null);

    const rawUrl = useMemo(() => toRawUrl(pdfUrl), [pdfUrl]);       // /get (raw bytes)
    const viewerUrl = useMemo(() => toViewUrl(pdfUrl), [pdfUrl]);   // /view
    const downloadUrl = useMemo(() => toDownloadUrl(pdfUrl, filename), [pdfUrl, filename]); // /get?dl=1&filename=...

    const { show, Toast } = useDownloadToast();

    // Fallback timer: if PDF.js struggles, swap to iframe viewer
    useEffect(() => {
        setFallback(false);
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = setTimeout(() => setFallback(true), 6000);
        return () => clearTimeout(fallbackTimerRef.current);
    }, [rawUrl]);

    const onDocLoad = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setError("");
        setFallback(false);
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };

    const onError = (e) => {
        console.error("[pdf] error:", e);
        setError(e?.message || "Failed to load PDF");
        setFallback(true);
    };

    // Listen for postMessage from the /view iframe's "Download" button
    // (Worker HTML sends {type:'r2-download'} on click.)
    useEffect(() => {
        const onMsg = (e) => {
            try {
                const viewerOrigin = new URL(viewerUrl).origin;
                if (e.origin === viewerOrigin && e.data && e.data.type === "r2-download") {
                    show("Downloading… check downloads");
                }
            } catch {
                /* ignore */
            }
        };
        window.addEventListener("message", onMsg);
        return () => window.removeEventListener("message", onMsg);
    }, [viewerUrl, show]);

    const canPrev = pageNumber > 1;
    const canNext = numPages ? pageNumber < numPages : false;

    return (
        <div className="pdf-viewer pdf-viewer--canvas">
            <div className="pdf-toolbar">
                <button onClick={() => canPrev && setPageNumber(p => p - 1)} disabled={!canPrev}>‹</button>
                <span className="pdf-page-indicator">{pageNumber}/{numPages || "—"}</span>
                <button onClick={() => canNext && setPageNumber(p => p + 1)} disabled={!canNext}>›</button>

                <div className="pdf-spacer" />
                <button onClick={() => setScale(s => Math.max(0.6, s - 0.1))}>–</button>
                <button onClick={() => setScale(1.1)}>Fit</button>
                <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))}>+</button>

                <a className="pdf-download" href={viewerUrl} target="_blank" rel="noopener noreferrer">
                    Open in new tab
                </a>
                <a
                    className="pdf-download"
                    href={downloadUrl}
                    onClick={(e) => {
                        e.preventDefault();
                        show("Downloading… check downloads");
                        // same-tab navigation is the most reliable for iOS/Safari/Chrome mobile
                        window.location.assign(downloadUrl);
                    }}
                >
                    Download
                </a>
            </div>

            <div className="pdf-canvas-wrap">
                {!fallback ? (
                    <Document
                        file={rawUrl}                          // IMPORTANT: raw bytes endpoint for react-pdf
                        loading={<div className="pdf-loading">Loading PDF…</div>}
                        onLoadSuccess={onDocLoad}
                        onLoadError={onError}
                        onSourceError={onError}
                        error={<div className="pdf-error">Couldn’t render PDF.</div>}
                    >
                        <Page pageNumber={pageNumber} scale={scale} renderAnnotationLayer renderTextLayer />
                    </Document>
                ) : (
                    <div className="pdf-fallback">
                        <iframe
                            className="pdf-frame"
                            src={viewerUrl}
                            title="PDF Viewer"
                            style={{ width: "100%", height: "80vh", border: 0 }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <a href={viewerUrl} target="_blank" rel="noreferrer">Open PDF</a>
                        </div>
                    </div>
                )}
                {error && <div className="pdf-error">{error}</div>}
            </div>

            <Toast />
        </div>
    );
};

export default PDFViewer;
