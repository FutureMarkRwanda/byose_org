import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";

function PresenceEyeP1S3() {
    return (
        <Slide backgroundImage="linear-gradient(45deg, #CAE5FF 0%, #F9F5FF 100%)">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h1" color="quaternary" className="slide-zoom-in">
                    PROBLEM
                </Heading>
                <Box width="70%" className="text-block fade-in-sequence">
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                        How often have you left your <b>charger</b> plugged in,
                        thinking it doesn’t matter? Leaving <b>electronics plugged</b> in,
                        <b>appliances</b> on standby, or <b>lights</b> on <b> <i>when you leave a room</i> </b> can all contribute to significant <b>energy waste</b> in your home.
                    </Text>
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                        This seemingly <b>minor energy waste</b> can add up to a substantial amount <b>over time</b>. It also contributes to unnecessary strain on the power grid and increased <b>carbon emissions</b>.
                    </Text>
                </Box>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S3;