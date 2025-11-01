/*feature-card-slider.jsx*/
import "../style/feature-card-slider-style.css"
import FeatureCard from "./feature-card";
import { useEffect, useMemo, useRef, useState } from "react";

const FeatureCardsSlider = ({
    items,
    autoPlay = true,
    interval = 4500,
    transitionMs = 650,
}) => {
    const realCount = items.length;
    const containerRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const isDragging = useRef(false);

    // Build 3× strip but keep hooks unconditional
    const strip = useMemo(
        () => (realCount ? [...items, ...items, ...items] : []),
        [items, realCount]
    );

    // Avoid math on 0; we still call hooks even with 0 items
    const GROUP = Math.max(realCount, 1);
    const START_INDEX = realCount ? GROUP : 0;

    // Start in the middle copy
    const [index, setIndex] = useState(START_INDEX);
    const [enableTransition, setEnableTransition] = useState(true);
    const [paused, setPaused] = useState(false);

    const activeDot = realCount ? index % GROUP : 0;

    // Reset to middle when items change
    useEffect(() => {
        if (!realCount) return;
        setEnableTransition(false);
        setIndex(GROUP);
        const timeoutId = setTimeout(() => setEnableTransition(true), 50);
        return () => clearTimeout(timeoutId);
    }, [realCount, GROUP]);

    // Auto-play - always runs regardless of mouse position
    useEffect(() => {
        if (!autoPlay || realCount < 2 || paused) return;
        const id = setInterval(() => setIndex((i) => i + 1), interval);
        return () => clearInterval(id);
    }, [autoPlay, interval, realCount, paused]);

    // Pause on hover
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onEnter = () => setPaused(true);
        const onLeave = () => setPaused(false);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    // Seamless forward-only loop: hop back one GROUP without transition
    const handleTransitionEnd = () => {
        if (realCount && index >= GROUP * 2) {
            setEnableTransition(false);
            setIndex((i) => i - GROUP);
            setTimeout(() => setEnableTransition(true), 50);
        }
    };

    const goTo = (realIdx) => {
        if (!realCount) return;
        setEnableTransition(true);
        setIndex(GROUP + realIdx); // jump to middle copy
    };

    // Touch handlers for swipe gestures
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        isDragging.current = true;
        setPaused(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging.current) return;
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        setPaused(false);

        const swipeDistance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50; // minimum distance for a swipe

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swiped left - go to next
                setIndex((i) => i + 1);
            } else {
                // Swiped right - go to previous
                setIndex((i) => Math.max(i - 1, 0));
            }
        }
    };

    // Safe to conditionally render AFTER hooks
    if (!realCount) return null;

    return (
        <div
            className="feature-slider"
            ref={containerRef}
            aria-roledescription="carousel"
            aria-label="Feature cards slider"
        >
            <div
                className="feature-slider-track"
                style={{
                    transform: `translateX(-${index * 100}%)`,
                    transition: enableTransition
                        ? `transform ${transitionMs}ms ease-in-out`
                        : "none",
                }}
                onTransitionEnd={handleTransitionEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {strip.map((item, i) => (
                    <div className="feature-slide" key={`${item.title}-${i}`}>
                        <FeatureCard
                            title={item.title}
                            icon={item.icon}
                            description={item.description}
                            bgColor={item.bgColor}
                        />
                    </div>
                ))}
            </div>

            <div className="feature-slider-dots" role="tablist" aria-label="Slide selectors">
                {items.map((_, i) => (
                    <button
                        key={i}
                        className={`feature-slider-dot ${activeDot === i ? "is-active" : ""}`}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        aria-selected={activeDot === i}
                        role="tab"
                    />
                ))}
            </div>
        </div>
    );
};

export default FeatureCardsSlider;