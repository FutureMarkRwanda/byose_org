import {
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {server} from "../../config/server_api.js";
import {sendData} from "../../utils/helper.js";
import {useNotification} from "../../context/NotificationContext.jsx";
import {handleGoogleLogin} from "../../utils/googleLoginHandler.js";
import {GoogleLogin} from "@react-oauth/google";


export function SignIn() {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);

  const [data, setData] = useState({
    email_phone: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const result = await sendData(`${server}/auth/login`, data, "");
      if (result.error) {
        showNotification(result.error,"error");
      } else {
          navigate(`/auth/otp/${data.email_phone}`);
      }
    } catch (err) {
      showNotification(err.message,"error");
    } finally {
      setLoader(false);
    }
  };

  return (
      <section className="h-[100vh] flex gap-4">
        <div className="w-full lg:w-3/5 mt-24">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mb-4">Sign In</Typography>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
            <div className="mb-1 flex flex-col gap-6">
              <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const token = credentialResponse.credential;
                await handleGoogleLogin(token, showNotification);
              }}
              onError={() => showNotification("Google Login Failed", "error")}
            />
            <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
              Enter your email and password to Sign In.
            </Typography>
              <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                Your email
              </Typography>
              <Input
                  size="lg"
                  placeholder="name@mail.com"
                  name="email_phone"
                  value={data.email_phone}
                  onChange={handleChange}
                  type="email"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"

              />
              <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                Password
              </Typography>
              <Input
                  type="password"
                  size="lg"
                  placeholder="********"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"

              />
            </div>
            <Checkbox
                label={
                  <Typography
                      variant="small"
                      color="gray"
                      className="flex items-center justify-start font-medium"
                  >
                    I agree to the&nbsp;
                    <a
                        href="#"
                        className="font-normal text-black transition-colors hover:text-gray-900 underline"
                    >
                      Terms and Conditions
                    </a>
                  </Typography>
                }
                containerProps={{ className: "-ml-2.5" }}
                required
            />
            <Button className="mt-6" fullWidth type="submit" disabled={loader}>
              {loader ? "Signing In..." : "Sign In"}
            </Button>

            <div className="flex items-center justify-between gap-2 mt-6">
              <Typography variant="small" className="font-medium text-gray-900">
                <a href="/auth/reset-password">
                  Forgot Password?
                </a>
              </Typography>
            </div>
          </form>
        </div>
        <div className="w-2/5 h-full  my-auto hidden lg:block">
          <img
              src="https://img.freepik.com/free-vector/blue-geometric-frame-vector_53876-170356.jpg?semt=ais_hybrid&w=740&q=80"
              className="h-full w-full object-cover rounded-l-3xl m-auto"
           alt={""}/>
        </div>
      </section>
  );
}

export default SignIn;