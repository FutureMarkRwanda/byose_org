import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import Header from "../../components/Header.jsx";

function Landing() {
    return (
        <div className="bg-[#FFFFFF] min-h-screen selection:bg-[#195C51]/20">
            <Header />
            <main className="pt-24">
                {/* Subtle ethereal background element */}
                <div className="fixed top-0 right-0 -z-10 opacity-40">
                    <img src="/assets/images/wave-t-haikei.svg" className="w-[60vw]" alt="" />
                </div>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Landing;