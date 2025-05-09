// eslint-disable-next-line no-unused-vars
import React from 'react';
import Banner from "../components/Banner.jsx";
import SimpleStore from "../components/SimpleStore.jsx";
import WhatWeLove from "../components/WhatWeLove.jsx";
import OurNumbers from "../components/OurNumbers.jsx";
import JoinUs from "../components/JoinUs.jsx";
import TitleColor from "../components/TitleColor.jsx";
import FAQs from "../components/FAQs.jsx";
import {Helmet} from "react-helmet";

function Home() {
    return (
        <div>
            <div className={`w-full bg-white p-8`}>
                <h1 className={`text-center mb-10 font-semibold md:w-[60%] w-[90%] mx-auto md:text-4xl text-2xl`}>We
                    believe in innovation that empowers everyone to <TitleColor text={"Use"}/> and <TitleColor
                        text={"Create"}/> smarter solutions</h1>
            </div>
            <Banner/>
            <amp-ad width="100vw" height="320"
                    type="adsense"
                    data-ad-client="ca-pub-9387926512029806"
                    data-ad-slot="8963292190"
                    data-auto-format="rspv"
                    data-full-width="">
                <div overflow=""></div>
            </amp-ad>
            <SimpleStore/>
            <WhatWeLove/>
            <OurNumbers/>
            <FAQs/>
            <JoinUs/>
        </div>
    );
}

export default Home;