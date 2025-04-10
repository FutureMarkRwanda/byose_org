// eslint-disable-next-line no-unused-vars
import React from 'react';
import ProductCard from "./ProductCard.jsx";
import {highlight_products} from "../utils/data.js";
import {GiCardPickup} from "react-icons/gi";
import {TbTruckDelivery} from "react-icons/tb";
import {MdOutlineAssistant, MdOutlineSchool} from "react-icons/md";
import {SiFsecure} from "react-icons/si";

function SimpleStore() {
    return (
        <div className={`bg-white py-4 pb-14 flex flex-col gap-14`}>
            <h1 className={`text-center font-bold py-6 md:text-4xl text-2xl`}>Grab Yours Across BYOSE</h1>
            <div className={`container mx-auto justify-between py-6 flex md:flex-row flex-col gap-4 `}>
                {highlight_products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            <div className={`md:w-[80%] w-[90%] bg-gray-100 md:p-8 p-6 mx-auto rounded-md text-center`}>
                <h2 className={`font-semibold py-5 mb-4`}>Enjoy Benefits with Every Purchase</h2>
                <div className={` md:grid grid-cols-4 flex flex-col gap-5  justify-between`}>

                    <div className={`mx-auto flex flex-col gap-4`}>
                        <h4 className={`flex gap-2 font-semibold`}>
                            <MdOutlineAssistant size={22}/>Support & Maintenance
                        </h4>
                        <p className={`pl-5 flex gap-2 text-start`}>
                            Enjoy one year of dedicated support and assistance for any issues with our products.
                        </p>
                    </div>
                    <div className={`mx-auto flex flex-col gap-4`}>
                        <h4 className={`flex gap-2 font-semibold`}>
                            <MdOutlineSchool size={22}/>Get Expertise
                        </h4>
                        <p className={`pl-5 text-start`}>
                            Gain industry-relevant skills and certifications in AI and robotics.Expert mentorship to help you
                            excel in the tech-driven world.
                        </p>
                    </div>
                    <div className={`mx-auto flex flex-col gap-4`}>
                        <h4 className={`flex gap-2 font-semibold`}>
                            <SiFsecure size={22}/>Limited warranty
                        </h4>
                        <p className={`pl-5 text-start`}>
                            Get a one-year warranty out of box with your purchase.
                        </p>
                    </div>

                    <div className={`mx-auto flex flex-col gap-4`}>
                        <h4 className={`flex gap-2 font-semibold `}>
                            <TbTruckDelivery size={22}/>Free Delivey or <GiCardPickup size={22}/>Pickup Orders
                        </h4>
                        <p className={`pl-5 flex gap-2 text-start`}>
                            Enjoy any type of order when you buy from the B-Store
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default SimpleStore;