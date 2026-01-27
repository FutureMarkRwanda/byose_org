import React from "react";
import TitleColor from "./TitleColor.jsx";
import { ImageGallery } from "./ImageGallery.jsx";
import { MdOutlineArrowForward } from "react-icons/md";

function ServiceCard({ service }) {
  const isRight = service.position === "right";

  return (
    <div className="container mx-auto px-6 py-24 border-b border-gray-50 last:border-0">
      <div className={`flex flex-col lg:flex-row items-center gap-16 ${isRight ? 'lg:flex-row-reverse' : ''}`}>
        
        {/* Content Area */}
        <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
          <div className="inline-block px-4 py-1 rounded-full bg-[#F5F5F5] text-gray-500 text-xs font-bold uppercase tracking-widest">
            0{service.id} — Core Platform
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            <TitleColor text={service.title} />
          </h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed max-w-xl">
            {service.description}
          </p>
          <a
            href={service.link}
            className="inline-flex items-center gap-3 text-[#195C51] font-bold group hover:underline"
          >
            Launch Experience
            <MdOutlineArrowForward className="transform group-hover:translate-x-2 transition-transform" />
          </a>
        </div>

        {/* Gallery Area */}
        <div className="lg:w-1/2 w-full flex justify-center">
            <div className="google-card p-2 bg-white">
                <ImageGallery images={service.images} />
            </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;