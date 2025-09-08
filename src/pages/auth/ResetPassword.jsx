import {
    Input,
    Button,
    Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {server} from "../../config/server_api.js";
import {sendData, setToken} from "../../utils/helper.js";
import {useNotification} from "../../context/NotificationContext.jsx";

export default function ResetPassword() {
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: "",
        verificationCode: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (step === 1) {
            // Step 1: Send Verification Code
            try {
                const result = await sendData(`${server}/auth/send-verification-code`, {
                    email: form.email,
                }, "");
                if (result.error) {
                    showNotification(result.error,"error");
                } else {
                    showNotification(result.message || "Verification code sent.","success");
                    setStep(2);
                }
            } catch (err) {
                showNotification("Failed to send code. Try again. "+err.message,"warning");
            } finally {
                setLoading(false);
            }
        } else {
            // Step 2: Submit new password
            const { email, verificationCode, newPassword, confirmPassword } = form;

            if (!email || !verificationCode || !newPassword || !confirmPassword) {
                showNotification("Please fill in all fields.","warning");
                setLoading(false);
                return;
            }

            if (newPassword !== confirmPassword) {
                showNotification("Passwords do not match.","warning");
                setLoading(false);
                return;
            }

            try {
                const result = await sendData(`${server}/auth/password-updated`, {
                    email,
                    verificationCode,
                    newPassword,
                }, "");
                if (result.error) {
                    showNotification(result.error,"error");
                } else {
                    if (result.data) {
                        setToken(result.data.token);
                    }
                    navigate("/dashboard");
                }
            } catch (err) {
                showNotification("Something went wrong. Try again. "+err.message,"error");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <section className="h-[100vh] flex gap-4">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">
                        {step === 1 ? "Reset Password" : "Set New Password"}
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        {step === 1
                            ? "Enter your email to receive a verification code."
                            : "Enter the code sent to your email and set a new password."}
                    </Typography>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 mx-auto w-80 max-w-screen-lg lg:w-1/2 flex flex-col gap-5">
                    {/* Email (always shown) */}
                    <Input
                        type="email"
                        name="email"
                        label="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="mb-4"
                        required
                        disabled={step === 2} // Lock email after step 1
                    />

                    {step === 2 && (
                        <>
                            <Input
                                type="text"
                                name="verificationCode"
                                label="Verification Code"
                                value={form.verificationCode}
                                onChange={handleChange}
                                className="mb-4"
                                required
                            />
                            <Input
                                type="password"
                                name="newPassword"
                                label="New Password"
                                value={form.newPassword}
                                onChange={handleChange}
                                className="mb-4"
                                required
                            />
                            <Input
                                type="password"
                                name="confirmPassword"
                                label="Confirm Password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="mb-4"
                                required
                            />
                        </>
                    )}

                    <Button type="submit" className={`my-5`} fullWidth disabled={loading}>
                        {loading ? "Processing..." : step === 1 ? "Send Code" : "Update Password"}
                    </Button>
                </form>
            </div>

            <div className="w-2/5 h-full  my-auto hidden lg:block">
                <img
                    src="https://img.freepik.com/free-vector/blue-geometric-frame-vector_53876-170356.jpg?semt=ais_hybrid&w=740&q=80"
                    alt="reset password illustration"
                    className="h-full w-full object-cover rounded-l-3xl"
                />
            </div>
        </section>
    );
}