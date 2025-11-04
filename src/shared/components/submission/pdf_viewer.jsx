// src/shared/components/submission/pdf_viewer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../../style/submission/pdf_viewer_style.css";

/**
 * Use a same-origin Module Worker to avoid dynamic import failures.
 * pdfjs-dist@5 prefers an ESM worker, so we point to /public/pdf.worker.min.mjs
 * and set workerPort instead of workerSrc.
 */
try {
    // Same-origin, works on localhost and when hosted
    const worker = new Worker(
        `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`,
        { type: "module" }
    );
    pdfjs.GlobalWorkerOptions.workerPort = worker;
} catch (e) {
    // Last resort fallback: try bundler-resolved worker (may fail on some setups)
    try {
        pdfjs.GlobalWorkerOptions.workerPort = new Worker(
            new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
            { type: "module" }
        );
    } catch {
        // Final fallback: disable worker (functional but slower for very large PDFs)
        console.error("PDF worker setup failed; falling back to no worker.", e);
    }
}

const PDFViewer = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.1);
    const [fileSource, setFileSource] = useState(pdfUrl);
    const [error, setError] = useState("");

    // Blob fallback to dodge weird hosts / previews / CORS
    useEffect(() => {
        let revokeUrl;
        (async () => {
            try {
                const res = await fetch(pdfUrl, { credentials: "omit" });
                const isPdf = res.headers.get("content-type")?.includes("pdf");
                if (!res.ok || !isPdf) {
                    setFileSource(pdfUrl);
                    return;
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setFileSource(url);
                revokeUrl = url;
            } catch {
                setFileSource(pdfUrl);
            }
        })();
        return () => {
            if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        };
    }, [pdfUrl]);

    const onDocLoad = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setError("");
    };

    const canPrev = pageNumber > 1;
    const canNext = numPages ? pageNumber < numPages : false;

    const goPrev = () => canPrev && setPageNumber((p) => p - 1);
    const goNext = () => canNext && setPageNumber((p) => p + 1);

    const zoomOut = () => setScale((s) => Math.max(0.6, s - 0.1));
    const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.1));
    const fitWidth = () => setScale(1.1);

    const file = useMemo(() => ({ url: fileSource, withCredentials: false }), [fileSource]);

    return (
        <div className="pdf-viewer pdf-viewer--canvas">
            <div className="pdf-toolbar">
                <button onClick={goPrev} disabled={!canPrev} aria-label="Previous page">‹</button>
                <span className="pdf-page-indicator">
          {pageNumber}/{numPages || "—"}
        </span>
                <button onClick={goNext} disabled={!canNext} aria-label="Next page">›</button>

                <div className="pdf-spacer" />
                <button onClick={zoomOut} aria-label="Zoom out">–</button>
                <button onClick={fitWidth} aria-label="Fit to width">Fit</button>
                <button onClick={zoomIn} aria-label="Zoom in">+</button>

                <a className="pdf-download" href={pdfUrl} target="_blank" rel="noreferrer">
                    Open in new tab
                </a>
            </div>

            <div className="pdf-canvas-wrap">
                <Document
                    file={file}
                    loading={<div className="pdf-loading">Loading PDF…</div>}
                    onLoadSuccess={onDocLoad}
                    onLoadError={(e) => setError(e?.message || "Failed to load PDF")}
                    onSourceError={(e) => setError(e?.message || "PDF source error")}
                    error={<div className="pdf-error">Couldn’t render PDF.</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        // If you ever remove the CSS imports above, set both to false:
                        // renderAnnotationLayer={false}
                        // renderTextLayer={false}
                        renderAnnotationLayer
                        renderTextLayer
                    />
                </Document>
                {error && <div className="pdf-error">{error}</div>}
            </div>
        </div>
    );
};

export default PDFViewer;
