// eslint-disable-next-line no-unused-vars
import React from 'react';
import {Box, FlexBox, Grid, Image, Slide} from "spectacle";

function PresenceEyeP1S10() {
    return (
        <Slide backgroundColor="darkBackground6">
            <FlexBox height="100%" flexDirection="column" alignItems="center" justifyContent="center">
                <h1 className="slide-bounce px-[10%] w-full font-bold text-white text-start py-2">
                    Challenges & Funding Needs
                </h1>
                <Grid
                    gridTemplateColumns="repeat(2, 1fr)"
                    className="gap-5 feature-list relative"
                    width="80%"
                    height="80%"
                >
                    <Box
                        width="100%"
                        height="100%"
                        backgroundColor="#5A0001"
                        borderRadius="3px"
                        display="flex"
                        alignItems="center"
                        justifytitle="center"
                        className="feature-item p-6  transition-transform duration-300 hover:scale-110 hover:z-10 hover:shadow-lg relative"
                        style={{ transformOrigin: "center" }}
                    >
                        <FlexBox height={"100%"} flexDirection="column"  justifyContent="between" alignItems="start" className={"gap-2"}>
                            <h2 className={`text-white text-xl font-bold`}>⚠️ Limited Resources</h2>
                            <p className={`text-white`}>To scale PresenceEye, we require capital for manufacturing, 3D printing, and production expansion.</p>
                            <p className={`text-white`}>Currently, we are producing manually Per order from law existing Materials, which limits efficiency and scalability.</p>
                        </FlexBox>
                    </Box>
                    <Box
                        width="100%"
                        height="100%"
                        backgroundColor="#49306B"
                        borderRadius="3px"
                        display="flex"
                        alignItems="center"
                        justifytitle="center"
                        className="feature-item p-6 text-white  transition-transform duration-300 hover:scale-110 hover:z-10 hover:shadow-lg relative"
                        style={{ transformOrigin: "center" }}
                    >
                        <FlexBox height={"100%"} flexDirection="column"  justifyContent="between" alignItems="start">
                            <h2 >💰  10,000 USD</h2>
                            <p>Breakdown of fund allocation:</p>
                            <p>40% - Bulk material procurement to reduce unit cost</p>
                            <p>30% - 3D printing for custom user designs</p>
                            <p>20% - Research & Development for AI-powered automation</p>
                            <p>10% - Marketing & Distribution</p>
                        </FlexBox>
                    </Box>
                    <Box
                        width="100%"
                        height="100%"
                        backgroundColor="#134611"
                        borderRadius="3px"
                        display="flex"
                        alignItems="center"
                        justifytitle="center"
                        className="feature-item p-6 text-white  transition-transform duration-300 hover:scale-110 hover:z-10 hover:shadow-lg relative"
                        style={{ transformOrigin: "center" }}
                    >
                        <FlexBox height={"100%"} flexDirection="column" className={"gap-1"}  justifyContent="between" alignItems="start">
                            <h2 className={`font-bold`} >📊 Expected Sales & Growth Plan</h2>
                            <p>Each PresenceEye Lite unit costs $50 to produce and is sold for $62.</p>

                            <p >Phase 1:</p>
                            <p >Initial investment: $10,000</p>
                            <p >Units produced: 150</p>
                            <p >Revenue generated: $9,300</p>

                            <p >Phase 2:</p>
                            <p >Reinvest 90% of revenue ($8,370)</p>
                            <p >Units produced: 200</p>
                            <p >Revenue generated: $12,400</p>

                            <h2 >Market demand: Growing smart home & energy conservation market</h2>                        </FlexBox>
                    </Box>
                </Grid>
            </FlexBox>
        </Slide>
    );
}

export default PresenceEyeP1S10;
