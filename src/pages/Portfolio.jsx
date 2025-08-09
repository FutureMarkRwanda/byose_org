// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { team } from "../utils/data.js";
import { ImageGallery } from "../components/ImageGallery.jsx";
import Markdown from "../components/Markdown.jsx";
import {IoReturnUpBack} from "react-icons/io5";

const image = "/assests/images/wave-vr-haikei.svg";

function Portfolio() {
    const { name } = useParams(); // get the name from request params
    const navigate = useNavigate(); // for going back
    const teammate = team.find(member => member.link.toLowerCase() === name.toLowerCase());

    if (!teammate) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold">Teammate not found</h1>
            </div>
        );
    }

    return (
        <div className="py-20 grid gap-4">

            {/* Back Button */}
            <div className="container mx-auto px-4">
                <IoReturnUpBack onClick={() => navigate(-1)} size={30} className="mb-4 flex items-center hover:scale-110 active:scale-125 #text-gray-800 rounded-lg" />
            </div>

            {/* Hero Section */}
            <div
                className="bg-gray-100 bg-no-repeat bg-right-top flex h-[77vh]"
                style={{ backgroundImage: `url(${image})` }}
            >
                <div className="container mx-auto xl:grid xl:grid-cols-2 grid-cols-1 flex flex-col gap-4">
                    <div className="flex flex-col justify-center gap-4 p-4">
                        <h1 className="font-bold xl:text-5xl text-3xl text-center">{teammate.name}</h1>
                        <h2 className="text-center text-lg font-medium">{teammate.role}</h2>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <img
                            src={teammate.image}
                            alt={teammate.name}
                            className={`w-[90%] h-[80%] object-contain object-center rounded-2xl ${teammate.color}  bg-white`}
                        />
                    </div>
                </div>
            </div>

            {/* Markdown Section */}
            <div className="container mx-auto px-16 py-8">
                <Markdown content={teammate.more} />
            </div>

            {/* Gallery Section */}
            <div className="container mx-auto xl:grid xl:grid-cols-2 grid-cols-1 flex flex-col gap-4">
                <div className="flex flex-col justify-center gap-4 p-4"></div>
                <div className="flex flex-col justify-center items-center">
                    <ImageGallery
                        images={teammate.images}
                    />
                </div>
            </div>
        </div>
    );
}

export default Portfolio;
