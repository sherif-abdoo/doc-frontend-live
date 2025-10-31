import React, { useId } from "react";
import "../style/filter_dropdown_style.css";


export default function FilterDropdown({
                                           label,
                                           options = [],
                                           value,
                                           onChange,
                                           disabled = false,
                                           className = "",
                                       }) {
    const id = useId();

    return (
        <label className={`filter-dropdown ${className}`} htmlFor={id}>
            {label && <span className="filter-label">{label}</span>}
            <select
                id={id}
                className="filter-select"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
