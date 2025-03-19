import React, {useEffect} from 'react';
import {Box, FlexBox, Grid, Slide, Text} from "spectacle";
import {getTextColor} from "../../utils/helper.js";

function PresenceEyeP1S7P0() {



    const featureItems = [
        { color: "#58A4B0", text: "2015", title: "2.6M (Households)" },
        { color: "#84732B", text: "3.66KWH", title: "Average daily Consumption" },
        { color: "#9D6381", text: "104.0(GW)", title: "Annual Consumption" },
        { color: "#28965A", text: "9.3B(FRW)", title: "Annual Expenditure" },
        { color: "#28965A", text: "0.93B(FRW)", title: "Phantom load(10%)" },
        { color: "#58A4B0", text: "2022", title: "3.3M (Households)" },
        { color: "#84732B", text: "8.5KWH", title: "Average daily Consumption" },
        { color: "#9D6381", text: "1012.0(GW)", title: "Annual Consumption" },
        { color: "#28965A", text: "91.1B(FRW)", title: "Annual Expenditure" },
        { color: "#28965A", text: "9.11B(FRW)", title: "Phantom load(10%)" },
        { color: "#58A4B0", text: "2025", title: "3.5M (Projected Households)" },
        { color: "#84732B", text: "7.27(KWH)", title: "Average daily Consumption" },
        { color: "#9D6381", text: "630.0(GW)", title: "Annual Consumption" },
        { color: "#28965A", text: "56.7B(FRW)", title: "Annual Expenditure" },
        { color: "#28965A", text: "5.67B(FRW)", title: "Phantom load(10%)" },
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
                    gridTemplateColumns="repeat(5, 1fr)"
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
export default PresenceEyeP1S7P0;