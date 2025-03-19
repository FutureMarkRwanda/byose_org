import React from 'react';
import {Box, FlexBox, Grid, Heading, Slide, Text} from "spectacle";

function PresenceEyeP1S5() {
    return (
        <Slide backgroundColor="background10">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifyContent="center">
                <Grid gridTemplateColumns="repeat(2, 1fr)" className={"gap-5 feature-list "} width="80%" height="80%" >
                    <Box width="100%" height="100%" backgroundColor="#58A4B0" borderRadius="3px" display="flex" alignItems="center" justifyContent="center" className={"feature-item"}>
                        <Text color="white">1</Text>
                    </Box>
                    <Box width="100%" height="100%" backgroundColor="#84732B" borderRadius="3px" display="flex" alignItems="center" justifyContent="center" className={"feature-item"}>
                        <Text color="white">2</Text>
                    </Box>
                    <Box width="100%" height="100%" backgroundColor="#9D6381" borderRadius="3px" display="flex" alignItems="center" justifyContent="center" className={"feature-item"}>
                        <Text color="white">3</Text>
                    </Box>
                    <Box width="100%" height="100%" backgroundColor="#28965A" borderRadius="3px" display="flex" alignItems="center" justifyContent="center" className={"feature-item"}>
                        <Text color="black">4</Text>
                    </Box>
                </Grid>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S5;