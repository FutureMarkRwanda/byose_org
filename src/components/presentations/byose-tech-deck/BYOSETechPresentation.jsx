// src/Presentation.js
// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect } from 'react';
import {
    Deck,
    DefaultTemplate,
} from 'spectacle';
import {BsEye, BsFullscreen} from "react-icons/bs";
import Company from "./Company.jsx";
import Problem from "./Problem.jsx";
import SolutionsTitle from "./SolutionsTitle.jsx";
import Solutions from "./Solutions.jsx";
import Market from "./Market.jsx";
import Products from "./Products.jsx";
import Traction from "./Traction.jsx";
import ChallengesFunding from "./ChallengesFunding.jsx";
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

const BYOSETechPresentation = () => {
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
                <Company/>
                <Problem/>
                <SolutionsTitle/>
                <Solutions/>
                <Market/>
                <Products/>
                <Traction/>
                <ChallengesFunding/>
                
            </Deck>
        </div>
    );
};

export default BYOSETechPresentation;