// eslint-disable-next-line no-unused-vars
import React from "react";
import TitleColor from "./TitleColor.jsx";
import { ImageGallery } from "./ImageGallery.jsx";

// eslint-disable-next-line react/prop-types
function ServiceCard({ service, className }) {
  return (
    <div
      className={`px-4 bg-white mb-8 py-8 rounded-3xl mx-auto container md:px-24 lg:px-8 ${className}`}
    >
      <div
        className={`grid md:grid-cols-2 grid-cols-1 gap-2 items-center w-full mb-10 justify-between lg:${
          service.position === "right" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Text Content */}
        <div
          className={`mb-16 lg:mb-0 lg:max-w-lg lg:pr-5 md:${
            service.position === "left"
              ? "order-1 justify-start"
              : "order-2 justify-end"
          }`}
        >
          <div className="max-w-xl mb-6">
            <h2 className="font-sans text-3xl sm:mt-0 mt-6 font-bold tracking-tight sm:text-4xl sm:leading-none max-w-lg mb-6">
              <TitleColor text={service.title} />
            </h2>
            <p className="md:text-lg text-lg text-gray-600">
              {service.description}
            </p>
          </div>
          <div className="space-x-4">
            <a
              href={service.link}
              className="text-neutral-800 text-lg font-medium inline-flex items-center"
            >
              <span> more →</span>
            </a>
          </div>
        </div>

        {/* Image Gallery */}
        <div
          className={`flex items-end md:${
            service.position === "left"
              ? "order-2 justify-end"
              : "order-1 justify-start"
          }`}
        >
          <ImageGallery images={service.images} />
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;
