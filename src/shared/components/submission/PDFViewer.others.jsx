// src/shared/components/submission/PDFViewer.others.jsx
import React, { useMemo } from "react";
import "../../style/submission/pdf_viewer_style.css";
import { toViewUrl, toDownloadUrl } from "../../../utils/pdfUrls";

const PDFViewer = ({ pdfUrl, filename }) => {
    const viewerUrl = useMemo(() => toViewUrl(pdfUrl), [pdfUrl]);
    const downloadUrl = useMemo(() => toDownloadUrl(pdfUrl, filename), [pdfUrl, filename]);

    return (
        <div className="pdf-viewer">
            <h1 className="pdf-viewer__title">PDF</h1>
            <iframe
                src={viewerUrl}
                title="PDF Viewer"
                className="pdf-frame"
                allow="autoplay"
                style={{ width: "100%", height: "80vh", border: 0 }}
            />
            <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                <a href={viewerUrl} target="_blank" rel="noopener noreferrer">Open in new tab</a>
                <a
                    href={downloadUrl}
                    onClick={(e) => {
                        e.preventDefault();
                        window.location.assign(downloadUrl);
                    }}
                >
                    Download
                </a>
            </div>
        </div>
    );
};

export default PDFViewer;
