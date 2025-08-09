// eslint-disable-next-line no-unused-vars
import React from 'react';

// eslint-disable-next-line react/prop-types
function ProfileCard({name,image,role,link}) {
    return (
        <a href={"/we-are/"+link}>
            <div className="space-y-4 text-center">
                <img className="aspect-square md:w-[75%] w-64 h-64 mx-auto object-cover rounded-xl"
                     src={image&&image}
                     alt={`a photo for ${name}`}
                     loading="lazy" width="640" height="805"/>
                <div>
                    <h4 className="text-2xl text-gray-900 font-semibold">{name&&name}</h4>
                    <span className="block text-md  font-medium text-gray-800">{role&&role}</span>
                </div>
            </div>
        </a>
    );
}

export default ProfileCard;