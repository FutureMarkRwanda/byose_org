import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";
import {getTextColor} from "../../utils/helper.js";

function PresenceEyeP1S6() {
    return (
        <Slide backgroundColor="darkBackground2">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h2" color="white" className="slide-bounce">
                    Power Direct
                </Heading>
                <FlexBox width="100%" height="100%" flexDirection="row" justifyContent="between" className={"feature-list gap-5"} >
                    <Box width="100%" height="60%" backgroundColor="#231651" borderRadius="3px" display="flex" alignItems="center" justifyContent="center" className={"feature-item"}>
                            <Text fontWeight={"bold"} fontSize={"h1"} color={getTextColor('#231651')} >1</Text>
                            <Text color={getTextColor('#231651')} >
                                <b>Take full control anytime!</b> Switch devices <b>on/off</b> manually via the PresenceEye app, ensuring instant access through our platform interfaces.
                            </Text>
                    </Box>
                    <div className="relative w-full h-full feature-item">
                        <Image
                            src="../../assests/images/manual_plug.png"
                            alt="PresenceEye Logo"
                            width="500px"
                            className="absolute top-0 right-[5rem] rotate-12 mr-2 transition-transform hover:rotate-0 duration-300 hover:scale-150"
                        />
                    </div>
                </FlexBox>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S6;