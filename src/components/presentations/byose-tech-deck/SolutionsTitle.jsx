import React from 'react';
import {Box, FlexBox, Heading, Slide, Text} from "spectacle";

function SolutionsTitle() {
    return (
        <Slide backgroundColor="darkBackground10">
            {/*<h2 className={`slide-bounce font-bold text-white text-xl`}>Presents!</h2>*/}
            <FlexBox height="100%" flexDirection="column"  justifyContent="center" padding="0 10%">
                <Heading fontSize="h1" color="#FFA3FF" className="slide-zoom-in">
                    <FlexBox alignItems="center" justifyContent="center" padding="0 10%">
                        SOLUTIONS
                    </FlexBox>
                </Heading>
            </FlexBox>
        </Slide>
    );
}

export default SolutionsTitle;