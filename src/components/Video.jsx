import React from "react";
import ReactPlayer from "react-player/youtube";

function Video({ url, no_auto }) {
    return (
        <div className="w-full flex justify-center items-center py-4">
            {/* 
               We use 'aspect-video' to force the 16:9 ratio.
               We use 'max-w-2xl' to keep the physical size compact.
               'rounded-[2.5rem]' matches the Antigravity/Google fluid aesthetic.
            */}
            <div className="w-full max-w-2xl lg:max-w-3xl overflow-hidden rounded-[2.5rem] shadow-xl border-[6px] border-[#F5F5F5] bg-black relative aspect-video">
                <ReactPlayer
                    url={url}
                    playing={!no_auto}
                    controls={true}
                    loop={true}
                    muted={!no_auto} // Most browsers block autoplay unless muted
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    config={{
                        youtube: {
                            playerVars: { 
                                modestbranding: 1, 
                                rel: 0, 
                                showinfo: 0 
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default Video;