// tailwind.config.js
import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Poppins for body, Host Grotesk for headings
        sans: ['Poppins', 'sans-serif'],
        display: ['Host Grotesk', 'sans-serif'],
      },
      colors: {
        // Shadcn-like slate palette for clean UI
        border: "hsl(214.3, 31.8%, 91.4%)",
        input: "hsl(214.3, 31.8%, 91.4%)",
        ring: "hsl(215, 20.2%, 65.1%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(222.2, 84%, 4.9%)",
        muted: {
          DEFAULT: "hsl(210, 40%, 96.1%)",
          foreground: "hsl(215.4, 16.3%, 46.9%)",
        },
      }
    },
  },
  plugins: [],
});