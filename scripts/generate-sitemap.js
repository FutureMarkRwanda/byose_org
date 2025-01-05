import { SitemapStream, streamToPromise } from "sitemap";
import { writeFile  } from "fs/promises";

const generateSitemap = async () => {
    const hostname = "https://byose.vercel.app/"; // Replace with your site's domain
    const routes = ["/", "/home", "/contact","/presence-eye","/news","/services","/we-are","/b-store","/b-tech-labs","/b-academy","/login","/signup"]; // Add all your routes here

    const sitemap = new SitemapStream({ hostname });

    routes.forEach((route) => {
        sitemap.write({ url: route, changefreq: "daily", priority: 0.8 });
    });

    sitemap.end();
    const sitemapXML = await streamToPromise(sitemap);

    // Write the sitemap to the public directory
    await writeFile("./public/sitemap.xml", sitemapXML);

    console.log("Sitemap generated successfully!");
};

generateSitemap().catch((err) => {
    console.error("Error generating sitemap:", err);
});
