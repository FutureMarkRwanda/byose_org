// eslint-disable-next-line no-unused-vars
import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";

function PresenceEyeP1S11() {
    return (
            <Slide backgroundColor="darkBackground10">
                <h2 className={`slide-bounce font-bold text-white text-xl`}>Next Big Launch!</h2>
                <FlexBox height="100%" flexDirection="column"  justifyContent="center" padding="0 10%">
                    <Heading fontSize="h1" color="#FFA3FF" className="slide-zoom-in">
                        <FlexBox alignItems="center" justifyContent="center" padding="0 10%">
                            Presence Eye Sense
                        </FlexBox>
                    </Heading>
                </FlexBox>
            </Slide>
    );
}

export default PresenceEyeP1S11;