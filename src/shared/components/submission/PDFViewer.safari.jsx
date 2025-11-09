import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../../style/submission/pdf_viewer_style.css";
import { toRawUrl, toViewUrl, toDownloadUrl } from "../../../utils/pdfUrls";

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

    const rawUrl = useMemo(() => toRawUrl(pdfUrl), [pdfUrl]);
    const viewerUrl = useMemo(() => toViewUrl(pdfUrl), [pdfUrl]);
    const downloadUrl = useMemo(() => toDownloadUrl(pdfUrl, filename), [pdfUrl, filename]);

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
                <a className="pdf-download" href={downloadUrl}>
                    Download
                </a>
            </div>

            <div className="pdf-canvas-wrap">
                {!fallback ? (
                    <Document
                        file={rawUrl}
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
                        <iframe className="pdf-frame" src={viewerUrl} title="PDF Viewer" />
                        <div style={{ marginTop: 8 }}>
                            <a href={viewerUrl} target="_blank" rel="noreferrer">Open PDF</a>
                        </div>
                    </div>
                )}
                {error && <div className="pdf-error">{error}</div>}
            </div>
        </div>
    );
};

export default PDFViewer;
