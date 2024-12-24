import './App.css'
import About from "./pages/About.jsx";
import Header from "./components/Header.jsx";
// eslint-disable-next-line no-unused-vars
import React from "react";
import Footer from "./components/Footer.jsx";

function App() {

  return (
      <div className={`bg-gray-100 text-gray-800`}>
          <div className={`container mx-auto`}>
            <Header/>
          </div>
          <div className={`min-h-[66vh] pt-32`}>
              {/*<Home/>*/}
            <About/>
          </div>
          <Footer/>
      </div>
  )
}

export default App
