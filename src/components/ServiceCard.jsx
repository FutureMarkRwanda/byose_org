// eslint-disable-next-line no-unused-vars
import React from 'react';
import TitleColor from "./TitleColor.jsx";

// eslint-disable-next-line react/prop-types
function ServiceCard({service,className}) {
    return (
        <div className={`px-4 bg-white mb-8 py-8 rounded-3xl mx-auto container lg:max-w-screen-xl md:px-24 lg:px-8 ${className}`}>
            {/* eslint-disable-next-line react/prop-types */}
            <div className={`grid md:grid-cols-2 grid-cols-1 gap-2 items-center  w-full mb-10  justify-between lg:${service.position==='right'?'flex-row-reverse':'flex-row'}`}>
                {/* eslint-disable-next-line react/prop-types */}
                <div className={`mb-16 lg:mb-0 lg:max-w-lg lg:pr-5 md:${service.position==='left'?'order-1 justify-start':'order-2 justify-end'} `}>
                    <div className="max-w-xl mb-6">
                        <h2 className="font-sans text-3xl sm:mt-0 mt-6 font-bold tracking-tight sm:text-4xl sm:leading-none max-w-lg mb-6">
                            {/* eslint-disable-next-line react/prop-types */}
                            <TitleColor text={service.title}/>
                        </h2>
                        <p className="md:text-lg text-lg text-gray-600">
                            {/* eslint-disable-next-line react/prop-types */}
                            {service.description}
                        </p>
                    </div>
                    <div className='space-x-4'>
                        {/* eslint-disable-next-line react/prop-types */}
                        <a href={service.link} className="text-neutral-800  text-lg font-medium inline-flex items-center">
                            <span> more →</span>
                        </a>
                    </div>
                </div>
                {/* eslint-disable-next-line react/prop-types */}
                <div className={`flex #justify-end items-end md:${service.position==='left'?'order-2 justify-end':'order-1 justify-start'} `}>
                {/* eslint-disable-next-line react/prop-types */}
                    <img alt="logo" width="420" height="120" className={`rounded-lg`} src={service.image}/>
                </div>
            </div>
        </div>
    );
}

export default ServiceCard;