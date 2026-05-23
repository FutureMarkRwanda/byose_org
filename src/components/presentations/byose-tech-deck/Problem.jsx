import {Box, FlexBox, Heading, Slide, Text} from "spectacle";

function Problem() {
    return (
        <Slide backgroundImage="linear-gradient(45deg, #CAE5FF 0%, #F9F5FF 100%)">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h1" color="quaternary" className="slide-zoom-in">
                    PROBLEM
                </Heading>
                <Box width="70%" className="text-block fade-in-sequence">
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                        Farmers lack affordable <b>smart tools</b> to monitor <b>land</b> and <b>Crops</b> to
                        maximize <b>Production</b>.
                    </Text>
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                        Students have limited access to hands-on <b>robotics</b> and <b>embedded systems</b> training.
                    </Text>
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                        Africa’s digital platforms are underdeveloped, leaving huge gaps in local content and
                        <b>innovation.</b>
                    </Text>
                </Box>
            </FlexBox>
        </Slide>
    );
}

export default Problem;