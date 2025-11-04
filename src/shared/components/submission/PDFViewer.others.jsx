// src/shared/components/submission/PDFViewer.others.jsx
import React from "react";
import "../../style/submission/pdf_viewer_style.css";

const PDFViewer = ({ pdfUrl }) => {
    return (

        <div className="pdf-viewer">
            <h1 className="pdf-viewer__title">Chrome</h1>
            <iframe
                src={pdfUrl}
                title="PDF Viewer"
                allow="autoplay"
            ></iframe>
        </div>
    );
};

export default PDFViewer;
