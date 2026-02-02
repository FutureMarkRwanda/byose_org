import React from "react";
import { FaGithub, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { TbBrandGmail } from "react-icons/tb";
import { Link } from 'react-router-dom'; 

function Footer() {
  const socialLinks = [
    {
      icon: FaInstagram,
      url: "https://www.instagram.com/_.byose._/",
      label: "Instagram",
    },
    {
      icon: FaGithub,
      url: "https://github.com/FutureMarkRwanda",
      label: "Github",
    },
    {
      icon: FaWhatsapp,
      url: "https://wa.me/250792403062",
      label: "Whatsapp",
    },
  ];

 const navigationLinks = [
    { name: "Home", path: "/", external: false },
    { name: "Services", path: "/services", external: false },
    { name: "B-Academy", path: "https://academy.byose.info", external: true },
    { name: "PresenceEye", path: "/presence-eye", external: false },
];

  
  return (
    <footer className="bg-[#0B121A] text-white pt-20 pb-10 rounded-t-[3rem]">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <a href="/home" className="flex items-center gap-3">
              <img
                src="/assets/icons/Logo03.svg"
                className="h-10"
                alt="BYOSE Logo"
              />
              <span className="text-2xl font-bold tracking-tighter text-white">
                BYOSE Tech
              </span>
            </a>
            <p className="max-w-md text-gray-400 text-lg font-light leading-relaxed">
              Transforming ideas into impactful digital solutions by leveraging
              AI and robotics, paving the way for a tech-savvy future.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank" // Opens in a new tab
                  rel="noopener noreferrer" // Security best practice
                  aria-label={social.label} // Accessibility for screen readers
                  className="p-3 rounded-xl bg-white/5 hover:bg-[#195C51] transition-all border border-white/10 group"
                >
                  <social.icon
                    size={20}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

<div className="flex flex-col space-y-4">
    <h3 className="text-sm font-bold uppercase tracking-widest text-[#195C51] mb-2">
        Navigation
    </h3>
    {navigationLinks.map((item) => (
        item.external ? (
            <a
                key={item.name}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#195C51] transition-colors text-sm font-medium"
            >
                {item.name}
            </a>
        ) : (
            <Link
                key={item.name}
                to={item.path}
                className="text-gray-400 hover:text-[#195C51] transition-colors text-sm font-medium"
            >
                {item.name}
            </Link>
        )
    ))}
</div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#195C51] mb-6">
              Contact
            </h3>
            <div className="flex flex-col space-y-4">
              <a
                href="mailto:rw.byose@email.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <TbBrandGmail className="text-[#195C51]" /> rw.byose@email.com
              </a>
              <p className="text-gray-400 font-light">Kigali, Rwanda</p>
            </div>
          </div>
        </div>

        <hr className="my-12 border-white/10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm italic">
            © {new Date().getFullYear()} BYOSE Tech Labs. Build Your Own
            Solutions Everywhere.
          </p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-500">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
