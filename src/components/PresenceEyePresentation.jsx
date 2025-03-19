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
import {BsFullscreen} from "react-icons/bs";
import Presence_eye_p1_s1 from "./slides_cards/Presence_eye_p1_s1.jsx";
import Presence_eye_p1_s2 from "./slides_cards/Presence_eye_p1_s2.jsx";
import Presence_eye_p1_s3 from "./slides_cards/Presence_eye_p1_s3.jsx";
import Presence_eye_p1_s4 from "./slides_cards/Presence_eye_p1_s4.jsx";
import Presence_eye_p1_s5 from "./slides_cards/Presence_eye_p1_s5.jsx";
import Presence_eye_p1_s6 from "./slides_cards/Presence_eye_p1_s6.jsx";
import Presence_eye_p1_s7 from "./slides_cards/Presence_eye_p1_s7.jsx";
import Presence_eye_p1_s8 from "./slides_cards/Presence_eye_p1_s8.jsx";
import Presence_eye_p1_s9 from "./slides_cards/Presence_eye_p1_s9.jsx";
// Custom theme with professional colors and styling
const theme = {
    colors: {
        primary: '#4A90E2',
        secondary: '#50E3C2',
        tertiary: '#F5A623',
        quaternary: '#1F2D3D',
        background: '#F9FAFC',
        background1: '#E3F2FD', // Light blue
        background2: '#F1F8E9', // Soft green
        background3: '#FFF3E0', // Warm beige
        background4: '#ECEFF1', // Cool gray
        background5: '#FBE9E7', // Gentle peach
        background6: '#EDE7F6', // Soft lavender
        background7: '#FAFAFA', // Near white
        background8: '#263238', // Dark slate for contrast
        background9: '#37474F', // Muted dark gray
        background10: '#1B1B1B', // Deep black for high contrast
        background11: '#370926', //Dark purple

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

    // Custom cursor style added through CSS
    useEffect(() => {
        document.body.classList.add('custom-cursor');

        return () => {
            document.body.classList.remove('custom-cursor');
        };
    }, []);

    return (
        <div ref={containerRef} className="presentation-container z-30">
            <button
                className="fullscreen-button"
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
                <Presence_eye_p1_s1/>
                {/*B-Bot Speech*/}
                <Presence_eye_p1_s2/>
                {/* Introducing Presence Eye Lite*/}
                <Presence_eye_p1_s3/>
                {/* Gesture Control Slide */}
                <Presence_eye_p1_s4/>
                {/*    */}
                <Presence_eye_p1_s5/>
            {/*    */}
                <Presence_eye_p1_s6/>
            {/*    */}
                <Presence_eye_p1_s7/>
                <Presence_eye_p1_s8/>
                <Presence_eye_p1_s9/>
            </Deck>
        </div>
    );
};

export default Presentation;