import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about-us/", "/success-stories", "/help", "/membership-plans"],
        disallow: [
          "/my-home/",
          "/user-info/",
          "/register-free/additional-",
          "/register-free/step-",
          "/register-free/mob-verification",
          "/register-free/email-verification",
          "/api/",
          "/print-self-profile",
        ],
      },
    ],
    sitemap: "https://anugrahamatrimony.com/sitemap.xml",
  };
}
