// eslint-disable-next-line no-unused-vars
import React from "react";
import {Outlet} from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import Header from "../../components/Header.jsx";
const image = "/assets/images/wave-t-haikei.svg";


function Landing() {

    return (
        <div className={`bg-white text-gray-800`}>
            <div className={`container mx-auto`}>
                <Header/>
            </div>
            <div className={`min-h-[66vh]`}>
                <div className={`h-[8rem] bg-cover bg-no-repeat`} style={{backgroundImage: `url(${image})`}}></div>
                <div>
                    <Outlet/>
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default Landing
