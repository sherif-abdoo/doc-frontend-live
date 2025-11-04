// src/shared/components/submission/PDFViewer.jsx
import React, { useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../../style/submission/pdf_viewer_style.css";

/**
 * IMPORTANT:
 * - Set REACT_APP_R2_READER_BASE to your READ worker (the one that supports GET/HEAD/OPTIONS).
 *   e.g. REACT_APP_R2_READER_BASE=https://r2-read.dok-uploads.workers.dev
 * - Do NOT use the PRESIGN worker for viewing.
 */
const R2_READER_BASE = (process.env.REACT_APP_R2_READER_BASE || "").trim();

/**
 * Robust URL mapper:
 * - If input already looks like a proper reader URL `/get?key=...`, return as-is.
 * - If input is a PRESIGN URL, rewrite it to the reader with the same key.
 * - If input is an r2.dev (or any storage) URL, derive key from pathname.
 * - If READER_BASE is missing, return original URL and warn.
 */
function toReaderUrl(inputUrl) {
    if (!R2_READER_BASE) {
        console.warn(
            "[PDFViewer] REACT_APP_R2_READER_BASE not set. Using original URL (may fail on Chrome Android or hit 405 if it's a presign URL)."
        );
        return inputUrl;
    }

    let inUrl;
    try {
        // Allow relative URLs by resolving against current origin
        inUrl = new URL(inputUrl, window.location.origin);
    } catch {
        // If it's not even a URL, treat it as a key (best effort)
        const out = new URL(R2_READER_BASE);
        if (!out.pathname.endsWith("/")) out.pathname += "/";
        out.pathname += "get";
        out.searchParams.set("key", String(inputUrl).replace(/^\/+/, ""));
        return out.toString();
    }

    const reader = new URL(R2_READER_BASE);

    // 1) If it's already a proper READER `/get?key=...`, keep it
    const isSameOriginAsReader = inUrl.origin === reader.origin;
    const isReaderGetPath = /\/get\/?$/.test(inUrl.pathname);
    const hasKeyParam = inUrl.searchParams.has("key");
    if (isSameOriginAsReader && isReaderGetPath && hasKeyParam) {
        return inUrl.toString();
    }

    // 2) If it's a PRESIGN host, rewrite to READER using either existing ?key or path as key
    const isPresignHost = /r2-presign/i.test(inUrl.host);
    if (isPresignHost) {
        const existingKey = inUrl.searchParams.get("key");
        const key = existingKey || inUrl.pathname.replace(/^\/+/, "");
        const out = new URL(R2_READER_BASE);
        if (!out.pathname.endsWith("/")) out.pathname += "/";
        out.pathname += "get";
        out.search = `?key=${encodeURIComponent(key)}`;
        return out.toString();
    }

    // 3) For r2.dev or any storage URL, derive key from path
    const keyFromPath = inUrl.pathname.replace(/^\/+/, "");
    const out = new URL(R2_READER_BASE);
    if (!out.pathname.endsWith("/")) out.pathname += "/";
    out.pathname += "get";
    out.search = `?key=${encodeURIComponent(keyFromPath)}`;
    return out.toString();
}

// Detect Safari (iOS & macOS)
function isSafari() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafariEngine = /^((?!chrome|android).)*safari/i.test(ua);
    return isIOS || isSafariEngine;
}

// PDF.js worker (same-origin module worker copied to /public via postinstall)
try {
    const workerUrl = `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;
    const worker = new Worker(workerUrl, { type: "module" });
    pdfjs.GlobalWorkerOptions.workerPort = worker;
} catch (e) {
    console.warn("[pdfjs] Worker setup failed; rendering may be slower.", e);
}

const PDFViewer = ({ pdfUrl }) => {
    const viewerUrl = useMemo(() => toReaderUrl(pdfUrl), [pdfUrl]);
    const safari = isSafari();

    // Helpful debug
    if (process.env.NODE_ENV !== "production") {
        console.debug("[PDFViewer] input:", pdfUrl);
        console.debug("[PDFViewer] viewerUrl:", viewerUrl);
    }

    return (
        <div className="pdf-viewer-wrapper">
            {!safari ? (
                // Non-Safari → iframe (reliable on Chrome Android + desktop)
                <iframe
                    src={`${viewerUrl}#view=FitH`}
                    className="pdf-iframe"
                    title="PDF Preview"
                    allowFullScreen
                />
            ) : (
                // Safari → PDF.js (Safari blocks PDF in iframes)
                <div className="pdf-viewer pdf-viewer--canvas">
                    <Document
                        file={viewerUrl}
                        loading={<div className="pdf-loading">Loading PDF…</div>}
                    >
                        <Page pageNumber={1} scale={1.2} renderAnnotationLayer renderTextLayer />
                    </Document>
                </div>
            )}
        </div>
    );
};

export default PDFViewer;
