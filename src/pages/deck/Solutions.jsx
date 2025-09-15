import {Box, FlexBox, Grid, Slide, Text} from "spectacle";
import {getTextColor} from "../../utils/helper.js";

function Solutions() {

    const featureItems = [
        { color: "#273B09", text: "1", title: "AgriTech Tools" ,p:""},
        { color: "#84732B", text: "2", title: "PresenceEye Lite", p:""},
        { color: "#E98A15", text: "3", title: "B-Academy",p:"" },
        { color: "#5A2328", text: "3", title: "Streaming Platform" ,p:""},
    ];

// Add dynamically calculated textColor
    const updatedFeatureItems = featureItems.map(item => ({
        ...item,
        textColor: getTextColor(item.color)
    }));
    return (
        <Slide backgroundColor="darkBackground1">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifytitle="center">
                <Grid
                    gridTemplateColumns="repeat(2, 1fr)"
                    className="gap-5 feature-list relative"
                    width="80%"
                    height="80%"
                >
                    {updatedFeatureItems
                        .map(({ color, text, textColor = "white",title }, index) => (
                        <Box
                            key={index}
                            width="100%"
                            height="100%"
                            backgroundColor={color}
                            borderRadius="3px"
                            display="flex"
                            alignItems="center"
                            justifytitle="center"
                            className="feature-item  transition-transform duration-300 hover:scale-110 hover:z-10 hover:shadow-lg relative"
                            style={{ transformOrigin: "center" }}
                        >
                            <FlexBox flexDirection="column" justifyContent="between" alignItems="start">
                                <Text fontWeight={"bold"} fontSize={"h1"} color={textColor}>{text}</Text>
                                {/*<Text fontWeight={"normal"} fontSize={"p"} color={textColor}>{text}</Text>*/}
                                <Text fontWeight={"bold"} fontSize={"h2"} color={textColor}>{title}</Text>
                            </FlexBox>
                        </Box>
                    ))}
                </Grid>
            </FlexBox>
        </Slide>
    );
}

export default Solutions;