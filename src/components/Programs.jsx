// eslint-disable-next-line no-unused-vars
import React from 'react';
import ServiceCard from "./ServiceCard.jsx";
import {servicesAndProducts} from "../utils/data.js";
function Programs() {
    return (
        <div id={`services`} className={`flex flex-col gap-2 text-gray-900 p-4`}>
            <h2 className={`text-center font-bold`}>EXPANDING POSSIBILITIES</h2>
            <h1 className={` text-center font-bold`}>Blending AI and Robotics into Daily Life</h1>
            {servicesAndProducts.map((product) => (
                <ServiceCard key={product.id} className={`fade-in delay-${product.id}`} service={product} />
            ))}
        </div>
    );
}

export default Programs;