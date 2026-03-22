import type { MetadataRoute } from "next";

const BASE_URL = "https://anugrahamatrimony.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    {
      url: `${BASE_URL}/about-us/anugraha-matrimony`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about-us/privacy-policy`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about-us/terms-of-service`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/success-stories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: `${BASE_URL}/help`, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${BASE_URL}/membership-plans`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const categories = [
    "catholic-matrimony",
    "christian-matrimony",
    "hindu-matrimony",
    "muslim-matrimony",
    "jain-matrimony",
    "kannadiga-matrimony",
    "karnataka-matrimony",
    "nri-matrimony",
    "occupation-matrimony",
    "community-matrimony",
    "mother-tongue-matrimony",
    "diocese-matrimony",
    "second-marriage-matrimony",
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${BASE_URL}/my-home/search/discover-profiles/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages];
}
