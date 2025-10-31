import React from "react";
import "../../style/submission/pdf_viewer_style.css";

const PDFViewer = ({ pdfUrl }) => {
  return (
    <div className="pdf-viewer">
      <iframe
        src={pdfUrl}
        title="PDF Viewer"
        allow="autoplay"
      ></iframe>
    </div>
  );
};

export default PDFViewer;
