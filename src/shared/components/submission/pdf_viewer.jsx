// src/shared/components/submission/pdf_viewer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../../style/submission/pdf_viewer_style.css";

/**
 * Worker setup: try module worker, fall back to classic file for older mobile WebKit.
 */
(function setupPdfWorker() {
    const base = process.env.PUBLIC_URL || "";
    const moduleUrl = `${base}/pdf.worker.min.mjs`;
    const classicUrl = `${base}/pdf.worker.min.js`;

    try {
        let supportsModule = false;
        try {
            // quick feature detect for module worker
            const test = new Worker(
                URL.createObjectURL(new Blob([""], { type: "application/javascript" })),
                { type: "module" }
            );
            test.terminate();
            supportsModule = true;
        } catch { /* noop */ }

        if (supportsModule) {
            pdfjs.GlobalWorkerOptions.workerPort = new Worker(moduleUrl, { type: "module" });
        } else {
            pdfjs.GlobalWorkerOptions.workerSrc = classicUrl;
        }
    } catch {
        pdfjs.GlobalWorkerOptions.workerSrc = classicUrl;
    }
})();

const PDFViewer = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.1);
    const [fileSource, setFileSource] = useState(pdfUrl);
    const [error, setError] = useState("");

    // Keep your blob-fallback logic (doesn't break existing PDFs)
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

    const file = useMemo(
        () => ({ url: fileSource, withCredentials: false }),
        [fileSource]
    );

    // Mobile-safe opener: create the tab synchronously in the click stack
    const openNewTab = (e) => {
        e.preventDefault();
        // open a placeholder immediately to satisfy popup blockers
        const w = window.open("about:blank", "_blank", "noopener,noreferrer");
        if (w) {
            // point it to the real PDF (served inline by the read worker)
            w.location.href = pdfUrl;
        } else {
            // as a last resort (some in-app browsers), replace current tab
            window.location.href = pdfUrl;
        }
    };

    return (
        <div className="pdf-viewer pdf-viewer--canvas">
            <div className="pdf-toolbar">
                <button onClick={goPrev} disabled={!canPrev} aria-label="Previous page">‹</button>
                <span className="pdf-page-indicator">{pageNumber}/{numPages || "—"}</span>
                <button onClick={goNext} disabled={!canNext} aria-label="Next page">›</button>

                <div className="pdf-spacer" />
                <button onClick={zoomOut} aria-label="Zoom out">–</button>
                <button onClick={fitWidth} aria-label="Fit to width">Fit</button>
                <button onClick={zoomIn} aria-label="Zoom in">+</button>

                {/* Mobile-safe link (uses handler to avoid blockers) */}
                <a className="pdf-download" href={pdfUrl} target="_blank" rel="noopener noreferrer" onClick={openNewTab}>
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
