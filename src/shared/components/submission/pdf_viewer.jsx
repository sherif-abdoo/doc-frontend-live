// src/shared/components/submission/PDFViewer.jsx
import React, { useEffect, useState } from "react";
import SafariPDFViewer from "./PDFViewer.safari.jsx";
import OtherPDFViewer from "./PDFViewer.others.jsx";

function isSafariUA(ua) {
    if (!ua) return false;
    // true for Safari (macOS/iOS), false for Chrome/Chromium/Edge/Opera/Firefox (incl. iOS variants)
    const hasSafari = /safari/i.test(ua);
    const isOther = /(chrome|chromium|crios|edg|edgios|opr|opios|fxios|firefox|brave)/i.test(ua);
    return hasSafari && !isOther;
}

const PDFViewer = (props) => {
    const [isSafari, setIsSafari] = useState(false);

    useEffect(() => {
        try {
            const ua = navigator.userAgent; // runtime only to avoid SSR mismatch
            setIsSafari(isSafariUA(ua));
        } catch {
            setIsSafari(false);
        }
    }, []);

    return isSafari ? <SafariPDFViewer {...props} /> : <OtherPDFViewer {...props} />;
};

export default PDFViewer;
