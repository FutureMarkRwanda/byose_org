import React from 'react';
import { Outlet } from "react-router-dom";
import TitleColor from "../../components/TitleColor.jsx";

function PresenceEye() {

    return (
        <section className="">
                <Outlet />
        </section>
    );
}

export default PresenceEye;