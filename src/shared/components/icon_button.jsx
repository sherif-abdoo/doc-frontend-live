import React from "react";

// Convert a color string to the same color with alpha applied (0..1).
// Supports: #RGB, #RRGGBB, rgb(), rgba(), hsl(), hsla().
// Falls back to a neutral rgba if parsing fails.
function toAlpha(color, alpha = 0.5) {
    if (!color) return `rgba(0,0,0,${alpha})`;
    const c = color.trim();

    // #RGB / #RRGGBB / #RRGGBBAA
    if (c.startsWith("#")) {
        let hex = c.slice(1);
        if (hex.length === 3) {
            // e.g. #abc -> #aabbcc
            hex = hex.split("").map((ch) => ch + ch).join("");
        }
        if (hex.length >= 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            if ([r, g, b].every((n) => Number.isFinite(n))) {
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
        }
    }

    // rgb() / rgba()
    {
        const m = c.match(
            /rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
        );
        if (m) {
            const r = Number(m[1]);
            const g = Number(m[2]);
            const b = Number(m[3]);
            if ([r, g, b].every((n) => Number.isFinite(n))) {
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
        }
    }

    // hsl() / hsla() with comma-separated syntax
    {
        const m = c.match(
            /hsla?\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,)\s]+)(?:\s*,\s*([^)]+))?\s*\)/i
        );
        if (m) {
            const h = m[1].trim();
            const s = m[2].trim();
            const l = m[3].trim();
            return `hsla(${h}, ${s}, ${l}, ${alpha})`;
        }
    }

    // Fallback
    return `rgba(0,0,0,${alpha})`;
}

const IconButton = ({
                        icon,
                        bg = "#111827",
                        onClick,
                        title,
                        disabled = false,
                        size = 36,
                        style,
                        borderWidth = 1.5,
                        borderRadius = 10,
                    }) => {
    const semiBg = toAlpha(bg, 0.1);

    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            disabled={disabled}
            style={{
                backgroundColor: semiBg,       // bg at 0.5 opacity
                color: bg,                     // icon color = border color
                width: size,
                height: size,
                borderRadius,
                border: `${borderWidth}px solid ${bg}`, // border line color = bg
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "transform 80ms ease",
                ...style,
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(1px)";
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            {icon}
        </button>
    );
};

export default IconButton;
