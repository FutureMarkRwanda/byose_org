// eslint-disable-next-line no-unused-vars
import React from 'react';
import {Box, FlexBox, Grid, Image, Slide} from "spectacle";

function ChallengesFundaing() {
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
                            <p className={`text-white`}>To scale BYOSE Tech along with its Product, we require capital for manufacturing, 3D printing, and production expansion.</p>
                            <p className={`text-white`}>Currently, we are producing Tools manually Per order from law existing Materials, which limits efficiency and scalability.</p>
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
                            <h2 >Goal: $25,000–$50,000 pre-seed.</h2>
                            <h2>Use of Funds:</h2>
                            <p>40% → Product R&D; (PresenceEye + AgriTech tool).</p>
                            <p>30% → Platform development (academy & streaming).</p>
                            <p>20% → Pilots & partnerships</p>
                            <p>10% → Branding & operations.</p>
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
                            <h2 className={`font-bold`} >📊 Business Model & Growth Plan</h2>
                            <p><b>AgriTech:</b> Hardware sales + subscription for advanced data insights</p>

                            <p ><b>PresenceEye:</b> Device sales (Lite,Sense,Dual and  Pro).</p>
                            <p ><b>B-Academy:</b> Free platform to build early adoption and loyalty among students who are expected future consumers.</p>
                            <p ><b>Streaming Platform:</b> Ad-supported model.</p>
                        </FlexBox>
                    </Box>
                </Grid>
            </FlexBox>
        </Slide>
    );
}

export default ChallengesFundaing;
