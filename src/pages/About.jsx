// eslint-disable-next-line no-unused-vars
import React from 'react';
import Introduction from "../components/Introduction.jsx";
import Programs from "../components/Programs.jsx";
import Action from "../components/Action.jsx";
import News from "../components/News.jsx";
import {Helmet} from "react-helmet";

function About() {
    return (
        <div className={`flex flex-col gap-2`}>
            <Helmet>
                <title>About BYOSE</title>
                <meta name="description" content="Learn more about our awesome services." />
                <meta name="robots" content="index, follow" />
            </Helmet>
            <Introduction/>
            <Programs/>
            <Action/>
            <News/>
        </div>
    );
}

export default About;