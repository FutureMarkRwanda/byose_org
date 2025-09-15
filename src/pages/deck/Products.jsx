// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, FlexBox, Grid, Heading, Slide, Text } from "spectacle";

const features = [
    // { icon: "📦", title: "Smart Delivery", description: "Send small items across rooms effortlessly." ,color:"",bg:"#880D1E"},
    { icon: "", title: "PresenceEye", description: "PresenceEye Lite prototype tested (smart extension) " ,link:"https://www.byose.info/presence-eye",color:"",bg:"#880D1E"},
    // { icon: "🌐", title: "Private LAN", description: "B-Bot creates its own local network for seamless control." ,color:"",bg:"#7D4600"},
    // { icon: "", title: "Vision Dashboard", description: "Live camera feed lets you see what B-Bot sees." ,color:"",bg:"#4464AD"},
    // { icon: "🛑", title: "Emergency Braking", description: "Built-in collision avoidance for safe movement.",color:"",bg:"#2E4057" },
    { icon: "", title: "Smart Farm", description: "Farm land health tracker prototype in progress.",color:"",bg:"#09814A" },
    { icon: "", title: "B-Academy", description: "Eduction Platforms live (students already trained in robotics & embedded systems) with online courses , Class and group management",link:"https://academy.byose.info", color:"",bg:"#656839" },
    { icon: "🎮", title: "Movie Streaming", description: "Streaming platform in testing, launch in December.",color:"",link:"https://movie-rw-mh82.onrender.com/",bg:"#3C6E71" },
];

// eslint-disable-next-line react/prop-types,no-unused-vars
const FeatureBox = ({ icon, title, description,bg,color,link }) => (
    <Box backgroundColor={bg} padding="10px" borderRadius="10px" textAlign="center">
        <Text fontSize="h4" color="white">{icon} <strong>{title}</strong></Text>
        <Text fontSize="h5" color="white">{description}</Text>
        {link&&<a href={link} className={"text-white"}>Read more</a>}
    </Box>
);

function Products() {
    return (
        <Slide backgroundColor="darkBackground5">
            <FlexBox height="100%" flexDirection="column" alignItems="start" justifyContent="center">
                <Heading fontSize="h2" color="white" className="slide-bounce">
                    Product (What We’ve Built)
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

export default Products;
