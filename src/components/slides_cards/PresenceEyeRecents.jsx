import {Box, FlexBox, Slide, Text} from "spectacle";

function PresenceEyeRecents() {
    return (
        <Slide backgroundColor="darkBackground2">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifyContent="center">
                <Box className="slide-entrance-delayed">
                    <Box alignItems="start" className="slide-entrance-delayed-2">
                        <Text fontSize="h1" color="white" fontWeight="bold">
                           Recent Improvements
                        </Text>
                        <Text  color="white" fontSize={"37px"} fontWeight="semibold">
                           <b>Wi-Fi integration:</b>  now supports direct Wi-Fi setup (no more hardcoding) .
                        </Text>
                        <Text  color="white" fontSize={"37px"} fontWeight="semibold">
                           <b>Enhanced voice recognition</b> for more accurate and responsive commands.
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

export default PresenceEyeRecents;