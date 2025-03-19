import React from 'react';
import {Box, FlexBox, Heading, Slide, Text} from "spectacle";

function PresenceEyeP1S0() {
    return (
        <Slide backgroundColor="background">
            <FlexBox height="100%" flexDirection="column" alignItems="flex-start" justifyContent="center" padding="0 10%">
                <Heading fontSize="h1" color="quaternary" className="slide-fade-right">
                    B-Bot
                </Heading>
                <Box width="100%" className="text-block">
                    <Text fontSize="text" color="quaternary" margin="8px 0">
                        In the last year, B-Bot was essential and highly appreciated by many users.
                    </Text>
                    <Text fontSize="text" color="quaternary" margin="8px 0">
                        Our customers asked if we could improve user interactions.
                    </Text>
                    <Text fontSize="text" color="quaternary" margin="8px 0">
                        Now, configure it directly through our mobile app!
                    </Text>
                </Box>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S0;