import React from 'react';
import {Box, FlexBox, Heading, Slide, Text} from "spectacle";

function PresenceEyeP1S9() {
    return (
        <Slide backgroundColor="quaternary">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h2" color="white" className="slide-bounce">
                    Advanced Control
                </Heading>
                <Box width="100%" height="100%" backgroundColor="#58A4B0" borderRadius="3px" display="flex" alignItems="center" justifyContent="center" className={"feature-item"}>
                    <Text color="white">1</Text>
                </Box>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S9;