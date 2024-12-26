// eslint-disable-next-line no-unused-vars
import React from 'react';
import Banner from "../components/Banner.jsx";
import SimpleStore from "../components/SimpleStore.jsx";
import WhatWeLove from "../components/WhatWeLove.jsx";
import OurNumbers from "../components/OurNumbers.jsx";
import JoinUs from "../components/JoinUs.jsx";
import TitleColor from "../components/TitleColor.jsx";
import FAQs from "../components/FAQs.jsx";

function Home() {
    return (
        <div>
            <div className={`w-full bg-white p-8`}>
                <h1 className={`text-center mb-10 font-semibold md:w-[60%] w-[90%] mx-auto md:text-4xl text-2xl`}>We
                    believe in innovation that empowers everyone to <TitleColor text={"Use"}/> and <TitleColor
                        text={"Create"}/> smarter solutions</h1>
            </div>
            <Banner/>
            <SimpleStore/>
            <WhatWeLove/>
            <OurNumbers/>
            <FAQs/>
            <JoinUs/>
        </div>
    );
}

export default Home;