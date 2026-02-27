// eslint-disable-next-line no-unused-vars
import React from 'react';
import ProfileCard from "./ProfileCard.jsx";
import {team} from "../utils/data.js";

function Team() {
    return (
        <div>
            <div className="container mx-auto py-12 md:py-20 px-6 flex flex-col gap-4">
                <h2 className="text-start font-bold text-xs md:text-sm">OUR TEAM</h2>
                <h1 className="text-start font-bold text-3xl md:text-4xl">Executives</h1>
                {/* Fixed width logic below */}
                <p className="text-start md:pl-6 w-full md:w-2/3 lg:w-1/2 text-gray-600 font-medium italic text-sm md:text-base">
                    At <b>BYOSE</b>, our strength is our people—passionate innovators...
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                    {team.map(member => (
                        <ProfileCard key={member.id} {...member} image={member.images[0]} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Team;