import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";

function PresenceEyeP1S8() {
    return (
        <Slide backgroundColor="darkBackground4">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h2" color="white" className="slide-bounce">
                    B-Bot Assist
                </Heading>
                <FlexBox width="100%" height="100%" flexDirection="row" justifyContent="between" className={"feature-list gap-5"} >
                    <Box width="100%" height="60%" backgroundColor="#58641D" borderRadius="3px" display="flex" alignItems="center" justifyContent="center" className={"feature-item"}>
                        <Text fontWeight={"bold"} fontSize={"h1"} color="#fff" >3</Text>
                        <Text color="#fff" >
                            <b>AI-powered home control!</b> The B-Bot home assistant responds to voice commands, helping you manage your plugs and devices based on their PresenceEye app configurations.
                        </Text>
                    </Box>
                    <div className="relative w-full h-full feature-item">
                        <Image
                            src="../../assests/images/manual_plug.png"
                            alt="PresenceEye Logo"
                            width="500px"
                            className="absolute top-0 right-[5rem] rotate-12 mr-2 transition-transform duration-300 hover:rotate-0 hover:scale-150"
                        />
                    </div>
                </FlexBox>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S8;