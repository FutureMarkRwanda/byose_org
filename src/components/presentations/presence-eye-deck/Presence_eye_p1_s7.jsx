import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";

function PresenceEyeP1S7() {
    return (
        <Slide backgroundColor="darkBackground12">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h2" color="white" className="slide-bounce">
                    SmartCharge
                </Heading>
                <FlexBox width="100%" height="100%" flexDirection="row" justifyContent="between" className={"feature-list gap-5"} >
                    <Box width="100%" height="60%" backgroundColor="#177E89" borderRadius="3px" display="flex" alignItems="center" justifyContent="center" className={"feature-item"}>
                            <Text fontWeight={"bold"} fontSize={"h1"} color="#fff" >2</Text>
                            <Text color="#fff" >
                                <b>No overcharging, no wasted power!</b> This plug automatically shuts off when your device is fully charged or unplugged, preventing vampire power drain from idle adapters, TVs, and chargers.
                            </Text>
                    </Box>
                    <div className="relative w-full h-full feature-item">
                        <Image
                            src="../../assests/images/automatic.png"
                            alt="PresenceEye Logo"
                            width="500px"
                            className="absolute top-0 right-[5rem] -rotate-12 mr-2 transition-transform hover:rotate-0 duration-300 hover:scale-150"
                        />
                    </div>
                </FlexBox>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S7;