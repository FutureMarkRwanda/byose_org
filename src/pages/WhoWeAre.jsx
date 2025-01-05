// eslint-disable-next-line no-unused-vars
import React from 'react';
import OurStory from "../components/OurStory.jsx";
import Team from "../components/Team.jsx";
import OurValues from "../components/OurValues.jsx";
import {Helmet} from "react-helmet";

function WhoWeAre() {
    return (
        <div>
            <Helmet>
                <title>Who We Are | BYOSE</title>
                <meta name="description" content="Learn about BYOSE's mission, vision, and the team driving innovation in AI and robotics." />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <OurStory/>
            <Team/>
            <OurValues/>
        </div>
    );
}

export default WhoWeAre;