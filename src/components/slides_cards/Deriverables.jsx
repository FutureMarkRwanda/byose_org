import React from 'react';
import {FlexBox, Slide,Box,Text} from "spectacle";

function Deriverables(props) {
    return (
        <Slide backgroundColor="darkBackground2">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifyContent="center">
                <Box className="slide-entrance-delayed">
                    <Box alignItems="start" className="slide-entrance-delayed-2">
                        <Text fontSize="h1" color="white" fontWeight="bold">
                            Deliverables & Next Steps
                        </Text>
                        <Text  color="white" fontSize={"37px"} fontWeight="semibold">
                            Roll out<b> PresenceEye Lite </b>to early testers.
                        </Text>
                        <Text  color="white" fontSize={"37px"} fontWeight="semibold">
                            Expand to advanced models <b>(Dual, Sense, Pro)</b> with monitoring & two-way switching.
                        </Text>
                        <Text  color="white" fontSize={"37px"} fontWeight="semibold">
                            Build toward a complete <b>smart home ecosystem</b> powered by PresenceEye.
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

export default Deriverables;