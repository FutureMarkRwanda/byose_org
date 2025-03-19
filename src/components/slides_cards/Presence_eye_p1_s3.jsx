import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";

function PresenceEyeP1S3() {
    return (
        <Slide backgroundColor="background1">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h1" color="quaternary" className="slide-zoom-in">
                    PROBLEM
                </Heading>
                <Box width="80%" className="text-block fade-in-sequence">
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                        By enabling Gesture Configuration on your device
                    </Text>
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                        You can control your device with custom gestures of your choice
                    </Text>
                </Box>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S3;