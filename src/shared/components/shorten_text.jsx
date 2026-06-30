import React from 'react';

const ShortenText = (text, limit = 60) => {
  if (typeof text !== "string") return ""; // safety check

  // If text is longer than the limit, wrap it in a span with a smaller font size
  if (text.length > limit) {
    let shrunkSize = "0.8em"; // default shrink for going over the limit

    // If it's way over the limit, shrink it just a bit more
    if (text.length > limit * 1.5) {
      shrunkSize = "0.68em";
    }
    if (text.length > limit * 2) {
      shrunkSize = "0.55em";
    }

    return (
        <span style={{
          fontSize: shrunkSize,
          display: "block",
          wordBreak: "break-word",
          lineHeight: "1.2"
        }}>
        {text}
      </span>
    );
  }

  // If it's under the limit, return normal text string
  return text;
};

export default ShortenText;