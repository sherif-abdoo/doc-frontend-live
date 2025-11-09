import React, { useMemo, useEffect } from "react";
import "../../style/submission/pdf_viewer_style.css";
import { toViewUrl, toDownloadUrl } from "../../../utils/pdfUrls";
import useDownloadToast from "./useDownloadToast";

const PDFViewer = ({ pdfUrl, filename }) => {
    const viewerUrl = useMemo(() => toViewUrl(pdfUrl), [pdfUrl]);
    const downloadUrl = useMemo(() => toDownloadUrl(pdfUrl, filename), [pdfUrl, filename]);
    const { show, Toast } = useDownloadToast();

    // 👇 show toast when the iframe's "Download" is clicked
    useEffect(() => {
        const onMsg = (e) => {
            try {
                const viewerOrigin = new URL(viewerUrl).origin;
                if (e.origin === viewerOrigin && e.data && e.data.type === "r2-download") {
                    show("Downloading… check downloads");
                }
            } catch {}
        };
        window.addEventListener("message", onMsg);
        return () => window.removeEventListener("message", onMsg);
    }, [viewerUrl, show]);

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
                <a
                    href={downloadUrl}
                    onClick={(e) => {
                        e.preventDefault();
                        show("Downloading… check downloads");
                        window.location.assign(downloadUrl);
                    }}
                >
                    Download
                </a>
            </div>
            <Toast />
        </div>
    );
};

export default PDFViewer;
