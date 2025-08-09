import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// eslint-disable-next-line react/prop-types
export const ImageGallery = ({ images = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // If no images provided, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images</p>
      </div>
    );
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setSelectedImageIndex(index);
  };

  return (
    <>
      {/* Gallery Preview Box */}
      <div
        className="relative w-56 h-56 cursor-pointer group rounded-lg overflow-hidden bg-gray-100"
        onClick={openModal}
      >
        {/* Images Layout */}
        <div className="flex h-full">
          {/* Large image on the left */}
          <div className="w-2/3 h-full">
            <img
              src={images[0]}
              alt="Gallery image 1"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Two smaller images on the right */}
          <div className="w-1/3 h-full flex flex-col">
            <div className="h-1/2 border-l border-white">
              <img
                src={images[1] || images[0]}
                alt="Gallery image 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-1/2 border-l border-t border-white">
              <img
                src={images[2] || images[1] || images[0]}
                alt="Gallery image 3"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="text-white text-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {images.length-1}+
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full max-h-full">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeft size={48} />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronRight size={48} />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={images[selectedImageIndex]}
                alt={`Gallery image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? "border-white"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
