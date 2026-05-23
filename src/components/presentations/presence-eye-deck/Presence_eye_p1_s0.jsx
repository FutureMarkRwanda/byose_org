import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";

function PresenceEyeP1S0() {
    return (
        <Slide backgroundColor="white">
            <div className="relative w-full h-full feature-item items-center flex justify-center">
                <Image
                    src="../../assests/images/output2.png"
                    alt="PresenceEye Logo"
                    width="80%"
                    className=" rotate-12 mr-2 transition-transform duration-300 hover:rotate-0 hover:scale-150"
                />
            </div>
        </Slide>
    );
}

export default PresenceEyeP1S0;