import React from "react";
import { Skeleton } from "@mui/material";
import ChevronDown from "./ChevronDown";
import ChevronUp from "./ChevronUp";
import "../style/month_selector_style.css";
import ShortenText from "../../../shared/components/shorten_text";

const MonthSelector = ({ selectedMonth, isDropdownOpen, months, onToggle, onSelect, loading = false }) => {
  if (loading) {
    return (
      <div className="month-selector-container">
        <Skeleton 
          variant="rounded" 
          width={120} 
          height={40} 
          sx={{ borderRadius: '8px' }}
        />
      </div>
    );
  }

  return (
    <div className="month-selector-container">
      <button className="month-selector" onClick={onToggle}>
        {selectedMonth}
        {isDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isDropdownOpen && (
        <div className="month-dropdown">
          {months.map((month) => (
            <div
              key={month}
              className="dropdown-item"
              onClick={() => onSelect(month)}
            >
              {ShortenText(month , 15)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthSelector;