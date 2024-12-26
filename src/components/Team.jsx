// eslint-disable-next-line no-unused-vars
import React from 'react';
import ProfileCard from "./ProfileCard.jsx";
import {team} from "../utils/data.js";

function Team() {
    return (
        <div>
            <div className={`container mx-auto md:py-20 py-16 p-6 flex flex-col gap-4`}>
                <h2 className={`text-start font-bold`}>OUR TEAM</h2>
                <h1 className={` text-start font-bold md:text-4xl text-2xl`}>Executives</h1>
                <p className={`text-start pl-6 md:w-1/2 sm:w-2/3 text-gray-600 font-medium italic`}>
                    At <b>BYOSE</b>, our strength is our people—passionate innovators and creative thinkers united by a vision to excel. Together, we bring diverse expertise to deliver cutting-edge solutions in e-commerce, IT, and beyond.
                </p>
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
                    {team.map(team => (
                        <ProfileCard key={team.id} name={team.name} image={team.image} role={team.role} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Team;