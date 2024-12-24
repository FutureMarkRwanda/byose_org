// eslint-disable-next-line no-unused-vars
import React from 'react';

// eslint-disable-next-line react/prop-types
function TitleColor({text}) {
    return (
        <span className={`bg-clip-text text-transparent bg-gradient-to-tr from-[#195C51] via-gray-800 to-[#195C51]`}>
            {text}
        </span>
    );
}

export default TitleColor;