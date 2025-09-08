import {
    Input,
    Button,
    Typography,
} from "@material-tailwind/react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {sendData, setToken} from "../../utils/helper.js";
import {server} from "../../config/server_api.js";
import {useNotification} from "../../context/NotificationContext.jsx";


export function Otp() {
    const { email } = useParams();
    const { showNotification } = useNotification();
    const [loader, setLoader] = useState(false);

    const [data, setData] = useState({
        email: "",
        verificationCode: "",
    });

    useEffect(() => {
        if (email) {
            setData((prev) => ({ ...prev, email }));
        } else {
            showNotification("Email not found in route.","error");
        }
    }, [email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);

        try {
            const result = await sendData(`${server}/auth/login/otp`, data, "");

            if (result.error) {
                showNotification(result.error,"error");
            } else {
                showNotification(result.message || "Verification successful!","success");

                if (result.data) {
                    setToken(result.data.token);
                }
                setTimeout(() => {
                   window.location = "/dashboard";
                }, 100);
            }
        } catch (err) {
            showNotification("Something went wrong. Please try again. "+err.message,"error");
        } finally {
            setLoader(false);
        }
    };

    return (
        <section className="m-4 h-[80vh] flex gap-4">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">
                        Email Verification
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Enter the verification code sent to <strong>{email}</strong>.
                    </Typography>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
                    <div className="mb-6 grid gap-4">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                            Verification Code
                        </Typography>
                        <Input
                            type="text"
                            name="verificationCode"
                            placeholder="Enter your code"
                            value={data.verificationCode}
                            onChange={handleChange}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            maxLength={5}
                        />
                    </div>

                    <Button
                        className="mt-4"
                        fullWidth
                        type="submit"
                        disabled={loader || !data.verificationCode}
                    >
                        {loader ? "Verifying..." : "Continue"}
                    </Button>

                    <div className="mt-6 text-center">
                        <Typography variant="small" className="text-gray-600">
                            Didn&#39;t receive the code?&nbsp;
                            <Link
                                to="/auth/sign-in"
                                // onClick={() => showNotification("Resend feature coming soon!")}
                                className="font-medium text-black underline hover:text-gray-900"
                            >
                                Resend
                            </Link>
                        </Typography>
                    </div>
                </form>
            </div>

            <div className="w-2/5 h-full hidden lg:block">
                <img
                    src="https://img.freepik.com/free-vector/blue-geometric-frame-vector_53876-170356.jpg?semt=ais_hybrid&w=740&q=80"
                    className="h-full w-full object-cover rounded-3xl"
                    alt="Pattern"
                />
            </div>
        </section>
    );
}

export default Otp;