// eslint-disable-next-line no-unused-vars
import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";

function PresenceEyeP1S3P2() {
    return (
        <Slide backgroundImage="linear-gradient(45deg, #CAE5FF 0%, #F9F5FF 100%)">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h2" color="quaternary" className="slide-zoom-in">
                    Vampire Power
                </Heading>
                <FlexBox alignItems="center" justifyContent="center">
                    <Box width="65%" className="text-block fade-in-sequence">
                        <Text fontSize="text" color="quaternary" margin="16px 0">
                            Refers to energy wasted by appliances that remain powered even when not in active use.
                        </Text>
                        <Text fontSize="text" color="quaternary" margin="16px 0">
                            For instance, a TV, even when turned off, might still consume power when connected to power. Similarly, phone chargers and laptop adapters draw power even when no device is connected. Such standby power consumption can be significant over time.
                        </Text>
                        <Text fontSize="text" color="quaternary" margin="16px 0">
                            <b>Vampire power accounts for as much as 20% of your monthly electricity bill</b>
                        </Text>
                    </Box>
                    <div className="relative w-full h-full feature-item">
                        <Image
                            src="../../assests/images/vimperpower.jpg"
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

export default PresenceEyeP1S3P2;