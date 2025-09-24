// eslint-disable-next-line no-unused-vars
import React from 'react';
import {Box, FlexBox, Slide, Text} from "spectacle";

function PresenceEyeOverview() {
    return (
        <Slide backgroundColor="darkBackground2">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifyContent="center">
                <Box className="slide-entrance-delayed">
                    <Box alignItems="start" className="slide-entrance-delayed-2">
                        <Text fontSize="h1" color="white" fontWeight="bold">
                            Overview & Vision
                        </Text>
                        <Text  color="white" fontSize={"37px"} fontWeight="semibold">
                            PresenceEye is our first step into smart home innovation, starting with an AI-powered multi-socket smart extension.
                        </Text>
                        <Text  color="white" fontSize={"37px"} fontWeight="semibold">
                            Our vision is to redefine energy use with intelligent control, monitoring, and automation for everyday devices.
                        </Text>
                        <Text fontSize="h2" color="white" fontWeight="bold">
                            – See, Sense, Save
                        </Text>
                    </Box>

                </Box>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeOverview;