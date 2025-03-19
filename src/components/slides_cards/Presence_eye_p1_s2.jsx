import React from 'react';
import {Box, FlexBox, Heading, Image, Slide, Text} from "spectacle";

function PresenceEyeP1S2() {
    return (
        <Slide backgroundImage="linear-gradient(45deg, #DFF3E4 0%, #F0F6F6 100%)">
            <FlexBox height="100%" flexDirection="column"  justifyContent="center" padding="0 10%">
                <Heading fontSize="h1" color="#38A368" className="slide-zoom-in">
                    <FlexBox alignItems="center">
                        <Image src="../../assests/icons/b-bot.png" alt="PresenceEye Logo" width={150} height={150} style={{ marginRight: '10px' }} />&nbsp;&nbsp;B-Bot
                    </FlexBox>
                </Heading>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S2;