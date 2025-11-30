// src/shared/components/submission/PDFViewer.jsx
import React, { useEffect, useState } from "react";
import SafariPDFViewer from "./PDFViewer.safari.jsx";
import OtherPDFViewer from "./PDFViewer.others.jsx";

function isSafariUA(ua) {
    if (!ua) return false;
    const hasSafari = /safari/i.test(ua);
    const isOther = /(chrome|chromium|crios|edg|edgios|opr|opios|fxios|firefox|brave)/i.test(ua);

    return hasSafari && !isOther;
}

const PDFViewer = (props) => {
    const [isSafari, setIsSafari] = useState(false);
    useEffect(() => {
        try { setIsSafari(isSafariUA(navigator.userAgent)); } catch { setIsSafari(false); }
    }, []);
    return isSafari ? <SafariPDFViewer {...props} /> : <OtherPDFViewer {...props} />;
};

export default PDFViewer;