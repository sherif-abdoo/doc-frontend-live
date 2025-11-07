// src/shared/components/submission/PDFViewer.others.jsx
import React, { useMemo } from "react";
import "../../style/submission/pdf_viewer_style.css";
import {toViewUrl} from "../../../utils/pdfUrls";

const PDFViewer = ({ pdfUrl }) => {
    const viewerUrl = useMemo(() => toViewUrl(pdfUrl), [pdfUrl]);
    return (
        <div className="pdf-viewer">
            <h1 className="pdf-viewer__title">PDF</h1>
            <iframe
                src={viewerUrl}   /* always the pdf.js viewer */
                title="PDF Viewer"
                className="pdf-frame"
                allow="autoplay"
            />
            <div style={{ marginTop: 8 }}>
                <a href={viewerUrl} target="_blank" rel="noopener noreferrer">Open in new tab</a>
            </div>
        </div>
    );
};

export default PDFViewer;
