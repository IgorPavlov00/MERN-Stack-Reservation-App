import React, { useRef, useEffect, useState } from "react";

import "./featuredProperties.css";

const FeaturedProperties = () => {
  const properties = [
    {
      image:
        "https://cf.bstatic.com/xdata/images/hotel/square600/13125860.webp?k=e148feeb802ac3d28d1391dad9e4cf1e12d9231f897d0b53ca067bde8a9d3355&o=&s=1",

      name: "Aparthotel Stare Miasto",

      city: "Madrid",

      price: 120,

      rating: 8.9,
    },

    {
      image:
        "https://i.pinimg.com/736x/ac/b1/b9/acb1b9af630dac34421a484a228c4371.jpg",

      name: "Comfort Suites Airport",

      city: "Austin",

      price: 140,

      rating: 9.3,
    },

    {
      image:
        "https://i.pinimg.com/736x/14/13/39/141339a58a42d89a7adec62465b504e6.jpg",

      name: "Four Seasons Hotel",

      city: "Dubai",

      price: 99,

      rating: 8.8,
    },

    {
      image:
        "https://i.pinimg.com/736x/db/56/46/db5646f3e0dc56de39bc46312f605863.jpg",

      name: "Hilton Garden Inn",

      city: "Berlin",

      price: 105,

      rating: 8.9,
    },

    {
      image:
        "https://i.pinimg.com/736x/3e/2d/63/3e2d635d2d8037d449be00577c24ca0f.jpg",

      name: "The Grand Estancia",

      city: "Madrid",

      price: 120,

      rating: 8.9,
    },

    {
      image:
        "https://i.pinimg.com/736x/98/11/28/9811281d2cfc1b9c593fb750f0f32d44.jpg",

      name: "The Royal Crest",

      city: "United Kingdoom",

      price: 140,

      rating: 9.3,
    },

    {
      image:
        "https://i.pinimg.com/736x/8d/95/12/8d9512bf267d21ed63826e44480a5b21.jpg",

      name: "The Rose Cottage",

      city: "Poland",

      price: 99,

      rating: 8.8,
    },

    {
      image:
        "https://i.pinimg.com/736x/01/fa/08/01fa08f7b25f0fbbe619a29eae53ed36.jpg",

      name: "The Meridian Grand",

      city: "Budapest",

      price: 105,

      rating: 8.9,
    },
  ];

  const containerRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const scroll = (direction) => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.offsetWidth / 3; // Width of one card

      const scrollAmount = direction * cardWidth;

      containerRef.current.scrollLeft += scrollAmount;

      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + (direction > 0 ? 1 : -1);

        return Math.max(0, Math.min(properties.length - 3, newIndex));
      });
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.offsetWidth / 3;

      containerRef.current.scrollLeft = currentIndex * cardWidth;
    }
  }, [currentIndex]);

  return (
    <div className="fp-container">
      <button
        className="fp-scroll-button fp-scroll-left"
        onClick={() => scroll(-1)}
        aria-label="Previous properties"
        disabled={currentIndex === 0}
      >
        &lt;
      </button>

      <div className="fp" ref={containerRef}>
        {properties.map((property, index) => (
          <div
            className={`fpItem ${
              index >= currentIndex && index < currentIndex + 3
                ? "fpItem-visible"
                : ""
            }`}
            key={property.name}
          >
            <img src={property.image} alt={property.name} className="fpImg" />

            <div className="fpDetails">
              <h3 className="fpName">{property.name}</h3>

              <div className="fpLocation">
                <span className="fpCity">{property.city}</span>
              </div>

              <div className="fpPricing">
                <span className="fpPrice">From ${property.price}</span>
              </div>

              <div className="fpRating">
                <button>{property.rating}</button>

                <span>
                  {property.rating > 9
                    ? "Exceptional"
                    : property.rating > 8
                    ? "Excellent"
                    : "Good"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="fp-scroll-button fp-scroll-right"
        onClick={() => scroll(1)}
        aria-label="Next properties"
        disabled={currentIndex >= properties.length - 1}
      >
        &gt;
      </button>
    </div>
  );
};

export default FeaturedProperties;
