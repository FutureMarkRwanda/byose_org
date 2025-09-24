import React from 'react';
import {Box, FlexBox, Slide, Text} from "spectacle";

function PresenceEyeCurrentProgress() {
    return (
        <Slide backgroundColor="darkBackground2">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifyContent="center">
                <Box className="slide-entrance-delayed">
                    <Box alignItems="start" className="slide-entrance-delayed-2">
                        <Text fontSize="h1" color="white" fontWeight="bold">
                            Current Progress
                        </Text>
                        <Text  color="white" fontSize={"37px"} fontWeight="semibold">
                           <b className={"text-yellow-300 text-[40px]"}>PresenceEye Lite</b> first working model of our smart extension.
                        </Text>
                        <Text  color="white" fontSize={"37px"} fontWeight="semibold">
                            Each plug offers 4 modes:
                            <ul type="triangle" className={"pl-16"}>
                                <li>🔶<b className={"text-yellow-300 text-[40px]"}>Manual </b>– instant control from the app.</li>
                                <li>🔶 <b className={"text-yellow-300 text-[40px]"}>Automatic </b>– prevents overcharging & phantom power loss (via “<b>Charge My Device</b>” integration).</li>
                                <li>🔶<b className={"text-yellow-300 text-[40px]"}>Timer </b>– set custom on/off schedules.</li>
                                <li>🔶<b className={"text-yellow-300 text-[40px]"}>Gesture/Voice</b> – accessibility through AI-driven voice commands (progress ongoing).</li>
                            </ul>
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

export default PresenceEyeCurrentProgress;