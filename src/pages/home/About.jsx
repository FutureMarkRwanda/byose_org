
import Introduction from "../../components/Introduction.jsx";
import Programs from "../../components/Programs.jsx";
import Action from "../../components/Action.jsx";
import News from "../../components/News.jsx";

function Services() {
    return (
        <div className={`flex flex-col gap-2`}>
            <Introduction/>
            <Programs/>
            <Action/>
            <News/>
        </div>
    );
}

export default Services;