import { useState, useEffect } from 'react';

// eslint-disable-next-line
export default function ImageSlider( {className,images,image_size,isbutton}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Example image URLs - replace with your actual images
    const mock_images = [
        "https://res.cloudinary.com/ddsojj7zo/image/upload/v1737309233/byose%20org%20site/gsgyn6yojnpzt8ayn4pv.png",
        "https://res.cloudinary.com/ddsojj7zo/image/upload/v1737309233/byose%20org%20site/gsgyn6yojnpzt8ayn4pv.png",
        "https://res.cloudinary.com/ddsojj7zo/image/upload/v1737309233/byose%20org%20site/gsgyn6yojnpzt8ayn4pv.png",
        "https://res.cloudinary.com/ddsojj7zo/image/upload/v1737309233/byose%20org%20site/gsgyn6yojnpzt8ayn4pv.png",
        "https://res.cloudinary.com/ddsojj7zo/image/upload/v1737309233/byose%20org%20site/gsgyn6yojnpzt8ayn4pv.png",
        "https://res.cloudinary.com/ddsojj7zo/image/upload/v1737309233/byose%20org%20site/gsgyn6yojnpzt8ayn4pv.png",
    ];

    images =images?images:mock_images;
    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                // eslint-disable-next-line react/prop-types
                setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
                setIsTransitioning(false);
            }, 500); // Match this with CSS transition time
        }, 3000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react/prop-types
    }, [images.length]);

    // Manual navigation functions
    const goToPrevious = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            // eslint-disable-next-line react/prop-types
            setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
            setIsTransitioning(false);
        }, 500);
    };

    const goToNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            // eslint-disable-next-line react/prop-types
            setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
            setIsTransitioning(false);
        }, 500);
    };

    const goToSlide = (index) => {
        if (index === currentIndex) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 500);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Main slider container */}
            <div className={`relative overflow-hidden  min-h-64 sm:min-h-80 md:min-h-96 rounded-lg ${className}`}>
                {/* Image container with transition */}
                <div
                    className={`absolute w-full h-full flex transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                >
                    <img
                        src={images[currentIndex]}
                        alt={`Slide ${currentIndex + 1}`}
                        className={`w-full h-full ${image_size}`}
                    />
                </div>

                {/* Navigation buttons */}
                {!isbutton &&<>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                        aria-label="Previous slide"
                    >
                        ←
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                        aria-label="Next slide"
                    >
                        →
                    </button>
                </>}
            </div>

            {/* Slide indicators */}
            {!isbutton&&<div className="flex justify-center mt-4 space-x-2">
                {/* eslint-disable-next-line react/prop-types */}
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-[#195C51]' : 'bg-gray-300'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>}
        </div>
    );
}