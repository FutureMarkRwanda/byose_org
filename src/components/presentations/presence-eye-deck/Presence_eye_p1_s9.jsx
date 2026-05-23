// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, FlexBox, Grid, Heading, Slide, Text } from "spectacle";

const features = [
    // { icon: "📦", title: "Smart Delivery", description: "Send small items across rooms effortlessly." ,color:"",bg:"#880D1E"},
    { icon: "📦", title: "Remote Control", description: "You Control Your Devices anywhere you could be in the world as long as you have internet." ,color:"",bg:"#880D1E"},
    // { icon: "🌐", title: "Private LAN", description: "B-Bot creates its own local network for seamless control." ,color:"",bg:"#7D4600"},
    // { icon: "🎥", title: "Vision Dashboard", description: "Live camera feed lets you see what B-Bot sees." ,color:"",bg:"#4464AD"},
    // { icon: "🎮", title: "Wearable Joystick", description: "Intuitive remote control for smooth navigation.",color:"",bg:"#3C6E71" },
    // { icon: "🛑", title: "Emergency Braking", description: "Built-in collision avoidance for safe movement.",color:"",bg:"#2E4057" },
    { icon: "⚡", title: "Auto-Recover Plugs", description: "Restores plug states after power loss.",color:"",bg:"#09814A" },
    { icon: "📶", title: "Smart Reconnect", description: "Automatically reconnects to the internet as it is available.",color:"",bg:"#656839" }
];

// eslint-disable-next-line react/prop-types,no-unused-vars
const FeatureBox = ({ icon, title, description,bg,color }) => (
    <Box backgroundColor={bg} padding="10px" borderRadius="10px" textAlign="center">
        <Text fontSize="h4" color="white">{icon} <strong>{title}</strong></Text>
        <Text fontSize="h5" color="white">{description}</Text>
    </Box>
);

function PresenceEyeP1S9() {
    return (
        <Slide backgroundColor="darkBackground5">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h2" color="white" className="slide-bounce">
                    Control & Capabilities
                </Heading>
                <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="10px" padding="10px" >
                    {features.map((feature, index) => (
                        <FeatureBox key={index} {...feature} />
                    ))}
                </Grid>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S9;
