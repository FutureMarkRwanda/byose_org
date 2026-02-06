import { Input, Checkbox, Button, Typography } from "@material-tailwind/react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { server } from "../../config/server_api.js";
import { sendData } from "../../utils/helper.js";
import { useNotification } from "../../context/NotificationContext.jsx";
import { handleGoogleLogin } from "../../utils/googleLoginHandler.js";
import { GoogleLogin } from "@react-oauth/google";
import { MdLockOutline, MdOutlineEmail, MdArrowBack } from "react-icons/md";

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
        showNotification(result.error, "error");
      } else {
        navigate(`/auth/otp/${data.email_phone}`);
      }
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoader(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#F8F9FA] grid lg:grid-cols-12 selection:bg-[#195C51]/20">
      
      {/* LEFT PANEL: BRAND & CONTEXT */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0B121A] relative overflow-hidden flex-col justify-between p-16">
        {/* Subtle Tech Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#195C51 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white group">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-[#195C51] transition-all">
                <MdArrowBack size={20}/>
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <img src="/assets/icons/Logo03.svg" className="h-16 w-16" alt="BYOSE Logo" />
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tighter">
            Command your <br/> <span className="text-[#195C51]">Ecosystem.</span>
          </h1>
          <p className="text-gray-400 text-lg font-light leading-relaxed max-w-sm">
            Access the BYOSE Cloud Infrastructure to manage your PresenceEye nodes and digital assets.
          </p>
        </div>

        <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">
                Secure Terminal v2.4.0
            </p>
        </div>
      </div>

      {/* RIGHT PANEL: LOGIN FORM */}
      <div className="col-span-12 lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-[#333333]">Administrator Login</h2>
            <p className="text-gray-500 font-medium">Verify your credentials to continue.</p>
          </div>

          <div className="google-card p-8 md:p-10 bg-white border-none shadow-2xl space-y-8">
            
            {/* Google Integration */}
            <div className="space-y-4">
               <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            const token = credentialResponse.credential;
                            await handleGoogleLogin(token, showNotification);
                        }}
                        onError={() => showNotification("Google Login Failed", "error")}
                        useOneTap
                        shape="pill"
                        theme="outline"
                    />
               </div>
               <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-gray-300">Or use identity</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Access</label>
                  <div className="relative group">
                    <MdOutlineEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#195C51] transition-colors" size={20}/>
                    <input 
                      type="email" 
                      name="email_phone"
                      value={data.email_phone}
                      onChange={handleChange}
                      required
                      placeholder="admin@byose.info"
                      className="w-full pl-12 pr-4 py-4 bg-[#F5F5F5] border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#195C51]/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Key</label>
                    <Link to="/auth/reset-password" name="password" className="text-[10px] font-black uppercase tracking-widest text-[#195C51] hover:underline">Forgot?</Link>
                  </div>
                  <div className="relative group">
                    <MdLockOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#195C51] transition-colors" size={20}/>
                    <input 
                      type="password" 
                      name="password"
                      value={data.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-[#F5F5F5] border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#195C51]/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <Checkbox 
                  id="terms"
                  ripple={false}
                  className="hover:before:opacity-0"
                  containerProps={{ className: "p-0" }}
                  required
                />
                <label htmlFor="terms" className="text-xs text-gray-500 font-medium cursor-pointer">
                    I acknowledge system security protocols
                </label>
              </div>

              <Button 
                fullWidth 
                type="submit" 
                disabled={loader}
                className="bg-[#195C51] py-4 rounded-2xl font-bold text-sm tracking-widest shadow-xl hover:bg-[#0E3A32] transition-all active:scale-95 disabled:opacity-50"
              >
                {loader ? "Authenticating..." : "Establish Connection"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 font-medium italic">
            "Security is not a product, but a process."
          </p>
        </div>
      </div>
    </section>
  );
}

export default SignIn;