// src/shared/components/submission/PDFViewer.others.jsx
import React, { useMemo, useState, useEffect } from "react";
import "../../style/submission/pdf_viewer_style.css";
import { toViewUrl, toRawUrl } from "../../../utils/pdfUrls";

const PDFViewer = ({ pdfUrl }) => {
    const viewerUrl = useMemo(() => toViewUrl(pdfUrl), [pdfUrl]);
    const rawUrl = useMemo(() => toRawUrl(pdfUrl), [pdfUrl]);
    const [iframeError, setIframeError] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        // Detect Android
        const ua = navigator.userAgent || "";
        setIsAndroid(/android/i.test(ua));
    }, []);

    const handleIframeError = () => {
        setIframeError(true);
    };

    // On Android, provide multiple fallback options
    if (isAndroid || iframeError) {
        return (
            <div className="pdf-viewer">
                <h1 className="pdf-viewer__title">PDF Document</h1>
                <div className="pdf-android-fallback">
                    <p>PDF viewing in browser:</p>
                    
                    {/* Try iframe first */}
                    {!iframeError && (
                        <iframe
                            src={viewerUrl}
                            title="PDF Viewer"
                            className="pdf-frame"
                            onError={handleIframeError}
                            allow="autoplay"
                        />
                    )}
                    
                    <div className="pdf-download-options">
                        <a 
                            href={viewerUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="pdf-button pdf-button--primary"
                        >
                            Open PDF in New Tab
                        </a>
                        
                        <a 
                            href={rawUrl} 
                            download
                            className="pdf-button pdf-button--secondary"
                        >
                            Download PDF
                        </a>
                        
                        {/* Google Docs Viewer fallback */}
                        <a 
                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pdf-button pdf-button--secondary"
                        >
                            Open with Google Docs Viewer
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Default iframe for non-Android browsers
    return (
        <div className="pdf-viewer">
            <h1 className="pdf-viewer__title">PDF</h1>
            <iframe
                src={viewerUrl}
                title="PDF Viewer"
                className="pdf-frame"
                allow="autoplay"
                onError={handleIframeError}
            />
            <div style={{ marginTop: 8 }}>
                <a href={viewerUrl} target="_blank" rel="noopener noreferrer">
                    Open in new tab
                </a>
            </div>
        </div>
    );
};

export default PDFViewer;