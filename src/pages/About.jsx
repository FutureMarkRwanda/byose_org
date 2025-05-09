// eslint-disable-next-line no-unused-vars
import React from 'react';
import Introduction from "../components/Introduction.jsx";
import Programs from "../components/Programs.jsx";
import Action from "../components/Action.jsx";
import News from "../components/News.jsx";

function About() {
    return (
        <div className={`flex flex-col gap-2`}>
            <Introduction/>
            <Programs/>
            <Action/>
            <News/>
        </div>
    );
}

export default About;