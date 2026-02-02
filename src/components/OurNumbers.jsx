// eslint-disable-next-line no-unused-vars
import React from 'react';

function OurNumbers() {
    return (
        <div className={` bg-white py-4`}>
            <div className={`md:w-[60%] w-[90%] mx-auto pb-6`}>
                <p className={` text-center w-[90%] mx-auto`}></p>
                <h1 className={`mx-auto text-center font-bold py-6 md:text-4xl text-2xl`}>Our Numbers</h1>
            </div>
            <div className={`container  mx-auto  font-bold py-6 grid grid-cols-3 gap-4 p-4 `}>
                <h1 className={`md:text-6xl text-3xl flex flex-col gap-3 align-middle justify-center items-center`}>
                    15+<span className={`text-[50%] font-normal`}>Projects</span>
                </h1>
                <h1 className={`md:text-6xl text-5xl flex flex-col gap-3 align-middle justify-center items-center`}>
                    7+<span className={`text-[50%] font-normal`}>Services</span>
                </h1>
                <h1 className={`md:text-6xl text-3xl flex flex-col gap-3 align-middle justify-center items-center`}>
                    10+<span className={`text-[50%] font-normal`}>Satisfied clients</span>
                </h1>
            </div>
        </div>
    );
}

export default OurNumbers;