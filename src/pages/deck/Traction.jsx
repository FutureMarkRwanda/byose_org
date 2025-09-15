import {Box, FlexBox, Heading, Slide, Text} from "spectacle";

function Traction() {
    return (
        <Slide backgroundImage="linear-gradient(45deg, #CAE5FF 0%, #F9F5FF 100%)">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h1" color="quaternary" className="slide-zoom-in">
                    Traction
                </Heading>
                <Box width="70%" className="text-block fade-in-sequence">
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                        Partnership with WithinTech Rwanda: Trained students in robotics & embedded systems.
                    </Text>
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                        Early prototype testing of PresenceEye Lite successful.
                    </Text>
                    <Text fontSize="text" color="quaternary" margin="16px 0">
                       Active learners on <a href={"https://academy.byose.info."}>academy.byose.info</a>
                    </Text>
                </Box>
            </FlexBox>
        </Slide>
    );
}

export default Traction;