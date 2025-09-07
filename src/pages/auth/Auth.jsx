import {Outlet} from "react-router-dom";

export function Auth() {

  return (
    <div className="relative min-h-screen w-full">
      <Outlet/>
    </div>
  );
}


export default Auth;
