// src/Presentation.js
// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect } from 'react';
import {
    Deck,
    Slide,
    DefaultTemplate,
    FlexBox,
    Heading,
    Text,
    Box,
    // eslint-disable-next-line no-unused-vars
    Image
} from 'spectacle';
import {BsEye, BsFullscreen} from "react-icons/bs";
import Presence_eye_p1_s1 from "../slides_cards/Presence_eye_p1_s1.jsx";
import Presence_eye_p1_s2 from "../slides_cards/Presence_eye_p1_s2.jsx";
import Presence_eye_p1_s3 from "../slides_cards/Presence_eye_p1_s3.jsx";
import Presence_eye_p1_s4 from "../slides_cards/Presence_eye_p1_s4.jsx";
import Presence_eye_p1_s5 from "../slides_cards/Presence_eye_p1_s5.jsx";
import Presence_eye_p1_s6 from "../slides_cards/Presence_eye_p1_s6.jsx";
import Presence_eye_p1_s7 from "../slides_cards/Presence_eye_p1_s7.jsx";
import Presence_eye_p1_s8 from "../slides_cards/Presence_eye_p1_s8.jsx";
import Presence_eye_p1_s9 from "../slides_cards/Presence_eye_p1_s9.jsx";
import Presence_eye_p1_s10 from "../slides_cards/Presence_eye_p1_s10.jsx";
import Presence_eye_p1_s11 from "../slides_cards/Presence_eye_p1_s11.jsx";
import Presence_eye_p1_s12 from "../slides_cards/Presence_eye_p1_s12.jsx";
import Presence_eye_p1_s0 from "../slides_cards/Presence_eye_p1_s0.jsx";
import Presence_eye_p1_s3_P2 from "../slides_cards/Presence_eye_p1_s3_P2.jsx";
import Presence_eye_p1_s7_P0 from "../slides_cards/Presence_eye_p1_s7_P0.jsx";
import Presence_eye_p1_s7_P1 from "../slides_cards/Presence_eye_p1_s7_P1.jsx";
import Image01 from "../slides_cards/Image01.jsx";
// Custom theme with professional colors and styling
const theme = {
    colors: {
        primary: '#4A90E2',
        secondary: '#50E3C2',
        tertiary: '#F5A623',
        quaternary: '#1F2D3D',
        darkBackground1: '#16222E', // Darker slate blue-gray
        darkBackground2: '#0F1721', // Almost black with blue tint
        darkBackground3: '#19212C', // Muted charcoal blue
        darkBackground4: '#111822', // Deep night blue
        darkBackground5: '#0E131B', // Shadow navy
        darkBackground6: '#141E29', // Dark stormy blue
        darkBackground7: '#101A26', // Midnight ocean
        darkBackground8: '#0C1118', // Pure deep black with a cool tint
        darkBackground9: '#1A242F', // Slightly muted deep blue-gray
        darkBackground10: '#121922', // Heavy dusk shade
        darkBackground11: '#19232E', // Steel gray with blue undertone
        darkBackground12: '#0B121A', // Blackened navy
    },
    fonts: {
        header: '"Montserrat", "Helvetica Neue", Helvetica, Arial, sans-serif',
        text: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    },
    fontSizes: {
        h1: '52px',
        h2: '36px',
        text: '24px',
        subtitle: '32px'
    }
};

// Available transitions: 'fade', 'slide', 'convex', 'concave', 'zoom'
// We'll cycle through them for visual variety
const transitions = ['fade', 'slide', 'zoom', 'convex'];

const Presentation = () => {
    const deckRef = useRef(null);
    const containerRef = useRef(null);

    // Handle fullscreen functionality
    const handleFullScreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                if (containerRef.current.requestFullscreen) {
                    containerRef.current.requestFullscreen();
                } else if (containerRef.current.mozRequestFullScreen) {
                    containerRef.current.mozRequestFullScreen();
                } else if (containerRef.current.webkitRequestFullscreen) {
                    containerRef.current.webkitRequestFullscreen();
                } else if (containerRef.current.msRequestFullscreen) {
                    containerRef.current.msRequestFullscreen();
                }
            }
        }
    };

    const  toggleMore = ()=>{

    }


    return (
        <div ref={containerRef} className="presentation-container z-30">
            <button
                className="fullscreen-button"
                onClick={toggleMore}
                aria-label="Toggle Fullscreen"
            >
                <BsEye size={24} />
            </button>
            <button
                className="fullscreen-button !right-[6rem]"
                onClick={handleFullScreen}
                aria-label="Toggle Fullscreen"
            >
                <BsFullscreen size={24} />
            </button>

            <Deck
                ref={deckRef}
                theme={theme}
                template={DefaultTemplate}
                transitionEffect={(index) => transitions[index % transitions.length]}
            >
                {/* Welcome Slide */}
                {/*<Presence_eye_p1_s1/>*/}
                {/*B-Bot Speech*/}
                {/*<Presence_eye_p1_s2/>*/}
                {/* Introducing Presence Eye Lite*/}

                {/*<Presence_eye_p1_s3/>*/}
                {/*<Presence_eye_p1_s3_P2/>*/}
                {/*<Presence_eye_p1_s7_P0/>*/}
                {/*<Presence_eye_p1_s7_P1/>*/}
                {/* Gesture Control Slide */}

                <Presence_eye_p1_s12/>

                <Presence_eye_p1_s4/>
                {/*<Image01/>*/}
                {/*    */}
                <Presence_eye_p1_s5/>
                {/*    */}
                {/*    */}
                <Presence_eye_p1_s6/>

                <Presence_eye_p1_s7/>

                <Presence_eye_p1_s8/>

                <Presence_eye_p1_s9/>

                {/*<Presence_eye_p1_s10/>*/}

                <Presence_eye_p1_s11/>

                <Presence_eye_p1_s12/>

                {/*<Presence_eye_p1_s0/>*/}
            </Deck>
        </div>
    );
};

export default Presentation;