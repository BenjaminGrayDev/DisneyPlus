import type { Media, Video, Logo } from "../types";
import { cache } from "react";
import shuffleMedias from "../helpers/shuffle-medias";

// ✅ Replace with your backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Group =
  | {
      name: "popular" | "top-rated" | "now-playing" | "upcoming";
      type: "movies";
      page: number;
    }
  | {
      name: "popular" | "top-rated" | "on-the-air" | "airing-today";
      type: "series";
      page: number;
    };

type Time = "day" | "week";
type Type = "movies" | "series" | "all" | string;

async function fetchAPI(url: string) {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (!data || data.status_code) {
      console.error(`API Error: ${data?.status_message || "Unknown error"}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    return null;
  }
}

const api = {
  get: {
    medias: {

      search: cache(async ({ query, page = 1 }: { query: string; page: number }) => {
        const url = `${API_BASE_URL}/media/search?query=${encodeURIComponent(query)}&page=${page}`;
        const data = await fetchAPI(url);

        console.log(`🔍 Fetching Search: ${url}`);

        if (!data || !Array.isArray(data)) {
            console.warn("⚠ API: Search returned null or invalid data.");
            return [];
        }

        return data
            .filter((media: any) => media.image?.poster && media.image?.backdrop && media.overview)
            .map((media: any) => ({
                id: media.id,
                title: media.title || "Unknown Title",
                isForAdult: media.isForAdult || false,
                type: media.type === "movies" ? "movies" : "series",
                image: {
                    poster: media.image?.poster || "",
                    backdrop: media.image?.backdrop || "",
                },
                overview: media.overview || "No overview available.",
                releasedAt: media.releasedAt || "Unknown",
                language: { original: media.language?.original || "Unknown" },
            })) as Media[];
    }),

      group: cache(async ({ name, type, page = 1 }: Group) => {
        const url = `${API_BASE_URL}/media/group/${type}/${name}?page=${page}`;

        console.log(`🔍 Fetching Group Media: ${url}`);
        const data = await fetchAPI(url);

        if (!data || !Array.isArray(data)) return [];

        return shuffleMedias(
          data
            .filter((media: any) => media.image.poster && media.image.backdrop && media.overview)
            .map((media: any) => ({
              id: media.id,
              title: media.title || media.name,
              isForAdult: media.isForAdult || false,
              type: type === "movies" ? "movies" : "series",
              image: {
                poster: media.image.poster || "",
                backdrop: media.image.backdrop || "",
              },
              overview: media.overview || "No overview available.",
              releasedAt: media.releasedAt || "Unknown",
              language: { original: media.language?.original || "Unknown" },
            }))
        );
      }),

      trending: cache(async ({ type }: { type: "movies" | "series" }) => {
        const url = `${API_BASE_URL}/media/trending/${type}`;
        const data = await fetchAPI(url);

        if (!data || !Array.isArray(data)) return [];

        return shuffleMedias(
          data.map((media: any) => ({
            id: media.id,
            title: media.title || media.name,
            isForAdult: media.isForAdult || false,
            type: media.type,
            image: {
              poster: media.image.poster || "",
              backdrop: media.image.backdrop || "",
            },
            overview: media.overview || "No overview available.",
            releasedAt: media.releasedAt || "Unknown",
            language: { original: media.language.original || "Unknown" },
          }))
        ) as Media[];
      }),

      similar: cache(async ({ type, id, page = 1 }: { type: "movies" | "series"; id: string; page?: number }) => {
        const url = `${API_BASE_URL}/media/${type}/${id}/similar?page=${page}`;

        console.log(`🔍 Fetching Similar Media: ${url}`);
        const data = await fetchAPI(url);

        if (!data || !Array.isArray(data)) return [];

        return data
          .filter((media: any) => media.poster_path && media.backdrop_path && media.overview)
          .map((media: any) => ({
            id: media.id,
            title: media.title || media.name,
            isForAdult: media.adult || false,
            type: type === "movies" ? "movies" : "series",
            image: {
              poster: media.poster_path || "",
              backdrop: media.backdrop_path || "",
            },
            overview: media.overview || "No overview available.",
            releasedAt: media.release_date || media.first_air_date || "Unknown",
            language: { original: media.original_language || "Unknown" },
          })) as Media[];
      }),

    },

    media: {
      details: cache(async ({ type, id }: { type: Type; id: string }) => {
        const url = `${API_BASE_URL}/media/${type}/${id}`; // 🔄 Fetch from your backend
        const data = await fetchAPI(url);
        if (!data) return null;

        return {
          id: data.id,
          title: data.title,
          isForAdult: data.isForAdult,
          type,
          image: {
            poster: data.image?.poster || "",
            backdrop: data.image?.backdrop || "",
          },
          overview: data.overview || "No overview available.",
          releasedAt: data.releasedAt || "Unknown",
          language: { original: data.language?.original || "Unknown" },
        } as Media;
      }),

      measure: cache(async ({ type, id }: { type: Type; id: string }) => {
        const url = `${API_BASE_URL}/media/${type}/${id}/measure`;
        const data = await fetchAPI(url);
        return data ? data.measure : null; // ✅ Return runtime or number_of_seasons
      }),

      video: cache(async ({ type, id }: { type: Type; id: string }) => {
        const url = `${API_BASE_URL}/media/${type}/${id}/videos`;
        const data = await fetchAPI(url);
        if (!data || !Array.isArray(data.results)) return null;

        const video = data.find((vid: Video) => (vid.type === "Trailer" || vid.type === "Teaser") && vid.isOfficial);

        return video || null;
      }),

      logo: cache(async ({ type, id }: { type: Type; id: string }) => {
        const url = `${API_BASE_URL}/media/${type}/${id}/images`;
        const data = await fetchAPI(url);

        // ✅ Ensure `data` exists
        if (!data || !data.logos) return null;  // 🔹 Handle undefined case

        // ✅ Ensure `logos` is an array
        const logos = Array.isArray(data.logos) ? data.logos : [];

        // ✅ Find the English logo (or fallback to the first logo if available)
        const logo = logos.find((logo: any) => logo.iso_639_1 === "en") || logos[0];

        if (!logo) return null; // ✅ If no logos exist, return null
        return {
          aspectRatio: logo.aspect_ratio || 1, // Default to 1 if missing
          width: logo.width || 500, // Default width if missing
          height: logo.height || Math.round(500 / (logo.aspect_ratio || 1)), // Calculate height if missing
          image: logo.file_path, // Use file path
        };
      }),

      spotlight: cache(async ({ type }: { type: "movies" | "series" | "all" }) => {
        const url = `${API_BASE_URL}/media/spotlight/${type}`;

        console.log(`🔍 Fetching Spotlight: ${url}`);

        try {
            const data = await fetchAPI(url);

            // ✅ Handle null response gracefully
            if (!data) {
                console.warn("⚠ API: Spotlight returned null.");
                return null;
            }

            // ✅ Ensure all required fields exist
            return {
                id: data.id || "unknown",
                title: data.title || data.name || "Unknown Title",
                isForAdult: data.isForAdult ?? false,  // ✅ Ensure boolean value
                type: data.type === "movies" ? "movies" : "series",
                image: {
                    poster: data.image?.poster || "",   // ✅ Ensure fallback values
                    backdrop: data.image?.backdrop || "",
                },
                overview: data.overview || "No overview available.",
                releasedAt: data.releasedAt || "Unknown",
                language: { original: data.language?.original || "Unknown" },
            } as Media;
        } catch (error) {
            console.error(`🚨 Error fetching Spotlight data: ${error}`);
            return null;  // Prevent app crash by returning null
        }
    }),
    },
  },
};

export default api;