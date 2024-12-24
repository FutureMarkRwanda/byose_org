// eslint-disable-next-line no-unused-vars
import React from 'react';
import {MdDoubleArrow} from "react-icons/md";

// eslint-disable-next-line react/prop-types
function ProductCard({product}) {
    return (
        <div className="mx-auto px-5">
            <div className="max-w-xs cursor-pointer rounded-lg bg-gray-100 p-2 shadow duration-150 hover:scale-105 hover:shadow-md">
                     {/* eslint-disable-next-line react/prop-types */}
                <img className="w-full rounded-lg object-cover object-center" src={product.image}
                     alt="product"/>
                {/* eslint-disable-next-line react/prop-types */}
                <p className="my-4 pl-4 font-bold text-gray-800">{product.name}</p>
                {/* eslint-disable-next-line react/prop-types */}
                <a  href={product.link} target="_blank" rel="noopener noreferrer" className="flex inline-block py-2 px-7 active:scale-110 text-base text-body-color font-medium hover:text-[#195C51] transition ">Find Your Favorite <MdDoubleArrow size={25} /></a>
            </div>
        </div>
    );
}

export default ProductCard;