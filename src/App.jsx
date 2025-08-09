import './App.css'
import About from "./pages/About.jsx";
import Header from "./components/Header.jsx";
// eslint-disable-next-line no-unused-vars
import React from "react";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import WhoWeAre from "./pages/WhoWeAre.jsx";
import { Route, Routes} from 'react-router-dom';
import MainPage from "./pages/MainPage.jsx";
import useUpdateTitle from "./hooks/useUpdateTitle.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import NotFound from "./pages/NotFound.jsx";
import PresenceEye from "./pages/PresenceEye.jsx";
import PresenceEyePrivacyPolicy from "./components/presence_eye/PresenceEyePrivacyPolicy.jsx";
import PresenceEyePresentation from "./components/presence_eye/PresenceEyePresentation.jsx";
import PresenceEyeLatest from "./components/presence_eye/PresenceEyeLatest.jsx";
import OurStory from "./components/OurStory.jsx";
import Team from "./components/Team.jsx";
import OurValues from "./components/OurValues.jsx";
import Portfolio from "./pages/Portfolio.jsx";
const image = " /assests/images/wave-t-haikei.svg";


function App() {
    const titleMap = {
        "/": "About | BYOSE",
        "/services": "Services at BYOSE",
        "/home": "Home | BYOSE ",
        "/contact": "Contact Us | BYOSE",
        "/news": "New & Blog | BYOSE",
        "/presence-eye": "PresenceEye | BYOSE",
        "/b-academy": "B-Academy | BYOSE ",
        "/b-store": "B-Store | BYOSE",
        "/b-tech-labs": "B-Tech Labs | BYOSE",
        "/we-are": "Who We Are | BYOSE",
        "/signup": "Create Account | BYOSE",
        "/login": "Login | BYOSE",
    };
    useUpdateTitle(titleMap);
  return (
      <div className={`bg-white text-gray-800`}>
          <div className={`container mx-auto`}>
            <Header/>
          </div>
          <div className={`min-h-[66vh]`}>
              <div className={`h-[8rem] bg-cover bg-no-repeat`} style={{ backgroundImage: `url(${image})` }} ></div>
                  <Routes>
                    <Route exact path="/" element={<MainPage/>}>
                        <Route index element={<About/>}/>
                        <Route path="/home" element={<Home/>}/>
                        <Route path="/we-are" element={<WhoWeAre/>}>
                            <Route index element={<><OurStory/><Team/><OurValues/></>}/>
                            <Route path={"/we-are/:name"} element={<Portfolio/>}/>
                        </Route>
                        <Route path="/contact" element={<ContactUs/>}/>
                        <Route path="/presence-eye" element={<PresenceEye/>}>
                            <Route index element={<PresenceEyeLatest/>}/>
                            <Route path="/presence-eye/terms-policy" element={<PresenceEyePrivacyPolicy/>}/>
                            <Route path="/presence-eye/presents" element={<PresenceEyePresentation/>}/>
                        </Route>
                        <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
          </div>
          <Footer/>
      </div>
  )
}

export default App
