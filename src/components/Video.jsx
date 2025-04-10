// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactPlayer from "react-player/youtube";

// eslint-disable-next-line react/prop-types
function CustomYouTubePlayer({url,no_auto}) {
    return (
        <div
            className="flex items-center justify-center bg-gray-900 p-2 rounded-3xl shadow-lg max-h-[60vh] min-h-[60vh] md:w-[55vw] mx-auto my-6"
            style={{ maxWidth: "850px",minHeight: "120px" }}
        >
            <div
                className="w-full h-full rounded-2xl overflow-hidden bg-black border-4 border-gray-800 relative"
                style={{ aspectRatio: "16/9" }}
            >
                <ReactPlayer
                    className="react-player"
                    url={url}
                    playing={!no_auto}
                    controls={true}
                    loop={true}
                    width="100%"
                    height="100%"
                />
            </div>
        </div>
    );
}

export default CustomYouTubePlayer;
