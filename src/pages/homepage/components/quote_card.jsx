import React, { useState, useEffect } from "react";

const QuoteCard = () => {
  const quotes = [
    {
      text: '"It always seems impossible until it\'s done."',
      author: "-Nelson Mandela",
      icon: "assets/Dashboard/Quotes-Icon1.png",
    },
    {
      text: '"You miss 100% of the shots you don\'t take."',
      author: "-Wayne Gretzky",
      icon: "assets/Dashboard/Quotes-Icon2.png",
    },
    {
      text: '"Don\'t be afraid to fail. Be afraid not to try."',
      author: "-Muhammed Ali",
      icon: "assets/Dashboard/Quotes-Icon3.png",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 4000); // every 4s
    return () => clearInterval(interval);
  }, [quotes.length]);

  const nextQuote = () => setCurrentIndex((prev) => (prev + 1) % quotes.length);
  const prevQuote = () => setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);

  return (
    <div className="quote-carousel">
      <button onClick={prevQuote} className="carousel-btn">‹</button>

      <div className="quote-content fade">
        <div className="quote-icon">
          <img src={quotes[currentIndex].icon} alt="quote icon" />
        </div>
        <div>
          <p className="quote-text">{quotes[currentIndex].text}</p>
          <p className="quote-author">{quotes[currentIndex].author}</p>

          <div className="carousel-dots">
            {quotes.map((_, idx) => (
              <div key={idx} className={`dot ${idx === currentIndex ? "active" : ""}`} />
            ))}
          </div>
        </div>
      </div>

      <button onClick={nextQuote} className="carousel-btn">›</button>
    </div>
  );
};

export default QuoteCard;
