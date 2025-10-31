import React, { useRef, useEffect, useState } from 'react';

const GoogleCalendar = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 880, height: 420 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        // Ensure minimum dimensions for mobile
        const finalWidth = Math.max(width - 20, 280);
        const finalHeight = Math.max(height - 20, 300);
        
        setDimensions({ width: finalWidth, height: finalHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(updateDimensions, 100);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  // Adjust calendar parameters based on screen size
  const getCalendarParams = () => {
    const isMobile = window.innerWidth <= 768;
    
    return {
      showTitle: 0,
      showDate: isMobile ? 0 : 1,
      showPrint: 0,
      showTz: 0,
      showCalendars: 0,
      showTabs: isMobile ? 0 : 1,
      mode: isMobile ? 'AGENDA' : 'MONTH', // Agenda view works better on mobile
    };
  };

  const params = getCalendarParams();
  
  const iframeCode = `<iframe 
    src="https://calendar.google.com/calendar/embed?height=${dimensions.height}&wkst=1&ctz=Africa%2FCairo&showPrint=${params.showPrint}&showTz=${params.showTz}&showTitle=${params.showTitle}&showDate=${params.showDate}&showCalendars=${params.showCalendars}&showTabs=${params.showTabs}&mode=${params.mode}&src=ZG9jb21hcmtoYWxpZEBnbWFpbC5jb20&color=%23039be5" 
    style="border:0; width: 100%; height: 100%;" 
    width="${dimensions.width}" 
    height="${dimensions.height}" 
    frameborder="0" 
    scrolling="no">
  </iframe>`;

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
      dangerouslySetInnerHTML={{ __html: iframeCode }} 
    />
  );
};

export default GoogleCalendar;