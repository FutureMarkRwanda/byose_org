import './App.css'
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Programs from "./pages/Programs.jsx";

function App() {

  return (
    <div className={`flex flex-col bg-gray-100 gap-2`}>
        <Home/>
        <Programs/>
        <Footer/>
    </div>
  )
}

export default App
