import React from 'react';
import Sidebar from './sidebar';
import '../style/layout.css';

const Layout = ({ children, bgColor, className = '' }) => {
  return (
    <div className={`layout-wrapper ${className}`}>
      <Sidebar bgColor={bgColor} />
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;