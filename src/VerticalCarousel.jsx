import React, { useEffect, useState, useRef } from "react";
import { Button } from "react-bootstrap";

const items = [
  "Item 1: Smooth auto scroll",
  "Item 2: Custom content here",
  "Item 3: Works with Bootstrap",
  "Item 4: Auto + Manual scroll",
  "Item 5: Easy to extend",
  "Item 6: Extra item for demo",
];

const VerticalCarousel = ({ interval = 3000, itemHeight = 150 }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isCentered, setIsCentered] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const containerRef = useRef(null);

  // Calculate how many items fit the viewport
  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.innerHeight;
      const count = Math.floor(viewportHeight / itemHeight);

      setVisibleCount(count);
      setIsCentered(items.length <= count);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [itemHeight]);

  // Clone first few items for smooth wrap-around
  const extendedItems =
    items.length > visibleCount
      ? [...items, ...items.slice(0, visibleCount)]
      : items;

  // Auto scroll
  useEffect(() => {
    if (isCentered) return;

    const timer = setInterval(() => {
      nextItem();
    }, interval);

    return () => clearInterval(timer);
  }, [interval, isCentered]);

  const nextItem = () => {
    setTransitionEnabled(true);
    setStartIndex((prev) => prev + 1);
  };

  const prevItem = () => {
    setTransitionEnabled(true);
    setStartIndex((prev) => prev - 1);
  };

  // Handle seamless wrap
  useEffect(() => {
    if (startIndex === items.length) {
      // reached the cloned items at the end → jump to start
      const timeout = setTimeout(() => {
        setTransitionEnabled(false);
        setStartIndex(0);
      }, 500); // match transition duration
      return () => clearTimeout(timeout);
    }
    if (startIndex < 0) {
      // going backward beyond start → jump to end
      const timeout = setTimeout(() => {
        setTransitionEnabled(false);
        setStartIndex(items.length - 1);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [startIndex]);

  // Current translate
  const translateY = isCentered ? 0 : startIndex * itemHeight;

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        height: "100vh",
        width: "300px",
        overflow: "hidden",
        borderLeft: "1px solid #2a2a2a",
        backgroundColor: "#181818",
        zIndex: 10,
        color: "#e4e4e4",
        justifyContent: isCentered ? "center" : "flex-start",
      }}
    >
      <div
        ref={containerRef}
        className="w-100"
        style={{
          transform: `translateY(-${translateY}px)`,
          transition: transitionEnabled ? "transform 0.5s ease" : "none",
        }}
      >
        {extendedItems.map((item, idx) => (
          <div
            key={idx}
            className="d-flex justify-content-center align-items-center"
            style={{
              height: `${itemHeight}px`,
              width: "100%",
              fontSize: "1.1rem",
              fontWeight: "600",
              backgroundColor: idx % 2 ? "#202123" : "#313538",
              borderBottom: "1px solid #2a2a2a",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Controls */}
      {!isCentered && (
        <div
          className="position-absolute d-flex justify-content-between"
          style={{
            bottom: "20px",
            width: "80%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Button variant="secondary" size="sm" onClick={prevItem}>
            ↑
          </Button>
          <Button variant="secondary" size="sm" onClick={nextItem}>
            ↓
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerticalCarousel;
