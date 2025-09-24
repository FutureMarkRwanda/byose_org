// eslint-disable-next-line no-unused-vars
import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";

function PresenceEyeP1S12({text}) {
    return (
        <Slide backgroundColor="#003366">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifyContent="center">
                <Box className="slide-entrance-delayed">
                    <FlexBox alignItems="center" className="slide-entrance-delayed-2">
                        <Text fontSize="h1" color="white" fontWeight="bold">
                            Presence-Eye
                        </Text>
                        <Image src="../../assests/icons/presence_eye_blue_icon.png" alt="PresenceEye Logo" width={200} height={200} style={{ marginRight: '10px' }} />
                    </FlexBox>
                    {text&&<FlexBox alignItems="center" className="slide-entrance-delayed-2">
                        <Text fontSize="32px" color="white" className={"italic"} fontWeight="normal">"{text}"</Text>
                    </FlexBox>}
                </Box>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S12;