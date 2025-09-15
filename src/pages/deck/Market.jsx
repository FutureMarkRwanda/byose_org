import React, {useEffect} from 'react';
import {Box, FlexBox, Grid, Slide, Text} from "spectacle";
import {getTextColor} from "../../utils/helper.js";

function Market() {



    const featureItems = [
        { color: "#58A4B0", text: "$1T market potential by 2030", title: "AgriTech in Africa" },
        { color: "#84732B", text: "African online education market growing at 12% CAGR", title: "EdTech" },
        { color: "#28965A", text: "Over 600M internet users in Africa, massive content demand.", title: "Digital Platforms" },
    ];

// Add dynamically calculated textColor
    const updatedFeatureItems = featureItems.map(item => ({
        ...item,
        textColor: getTextColor(item.color)
    }));
    return (
        <Slide backgroundColor="darkBackground3">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifytitle="center">
                <Grid
                    gridTemplateColumns="repeat(2, 1fr)"
                    className="gap-5 feature-list relative"
                    width="80%"
                    height="80%"
                >
                    {updatedFeatureItems.map(({ color, text, textColor = "white", title }, index) => (
                        <Box
                            key={index}
                            width="100%"
                            backgroundColor={color}
                            borderRadius="3px"
                            display="flex"
                            alignItems="center"
                            className="feature-item transition-transform duration-200 hover:scale-110 hover:z-10 hover:shadow-lg relative"
                            style={{
                                transformOrigin: "center",
                                animationDelay: `${0.2 * index}s`,
                            }}
                        >
                            <FlexBox
                                height={"100%"}
                                flexDirection="column"
                                justifyContent="between"
                                alignItems="start"
                            >
                                <Text fontWeight={"bold"} fontSize={""} color={textColor}>
                                    {text}
                                </Text>
                                <Text fontWeight={"bold"} fontSize={""} color={textColor}>
                                    {title}
                                </Text>
                            </FlexBox>
                        </Box>
                    ))}
                </Grid>
            </FlexBox>
        </Slide>
    );
}
export default Market;