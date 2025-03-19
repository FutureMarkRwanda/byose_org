// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, FlexBox, Heading, Slide, Text, Image } from "spectacle";

function PresenceEyeP1S1() {
    return (
        <Slide backgroundImage="linear-gradient(45deg, #4A90E2 0%, #50E3C2 100%)">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifyContent="center">
                <Heading fontSize="h1" color="white" className="slide-entrance">
                    Welcome!
                </Heading>
                <Box className="slide-entrance-delayed">
                    <p className="slide-entrance-delayed-2 text-center text-3xl font-bold text-white">
                        This
                    </p>
                    <p className="slide-entrance-delayed-2 text-center text-3xl font-bold text-white">
                        is
                    </p>
                    <FlexBox alignItems="center" className="slide-entrance-delayed-2">
                        <Text fontSize="h1" color="white" fontWeight="bold">
                            Presence-Eye
                        </Text>
                        <Image src="../../assests/icons/presence_eye_blue_icon.png" alt="PresenceEye Logo" width={200} height={200} style={{ marginRight: '10px' }} />
                    </FlexBox>
                </Box>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S1;
