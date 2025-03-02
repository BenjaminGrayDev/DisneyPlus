import type { Media, Video, Logo } from "../types";
import { cache } from "react";
import shuffleMedias from "../helpers/shuffle-medias";
import axios from "axios";

// ✅ Replace with your backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_API_URL = process.env.TMDB_API_URL!;

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

      group: cache(async ({ name, type, page = 1 }: { name: string; type: "movies" | "series"; page: number }) => {
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

      trending: cache(async ({ type }: { type: Type }) => {
        const url = `${TMDB_API_URL}/3/trending/${type === "movies" ? "movie" : "tv"}/day?api_key=${TMDB_API_KEY}`;
        const data = await fetchAPI(url);
        if (!data || !Array.isArray(data.results)) return [];

        return shuffleMedias(
          data.results.map((media: any) => ({
            id: media.id,
            title: media.title || media.name,
            isForAdult: media.adult,
            type: type === "movies" ? "movies" : "series",
            image: {
              poster: media.poster_path,
              backdrop: media.backdrop_path,
            },
            overview: media.overview,
            releasedAt: media.release_date || media.first_air_date,
            language: { original: media.original_language },
          }))
        ) as Media[];
      }),
    },

    media: {
      details: cache(async ({ type, id }: { type: Type; id: string }) => {
        const url = `${TMDB_API_URL}/3/${type === "movies" ? "movie" : "tv"}/${id}?api_key=${TMDB_API_KEY}&language=en-US`;
        const data = await fetchAPI(url);
        if (!data) return null;

        return {
          id: data.id,
          title: data.title || data.name,
          isForAdult: data.adult,
          type,
          image: {
            poster: data.poster_path,
            backdrop: data.backdrop_path,
          },
          overview: data.overview,
          releasedAt: data.release_date || data.first_air_date,
          language: { original: data.original_language },
        } as Media;
      }),

      measure: cache(async ({ type, id }: { type: Type; id: string }) => {
        const url = `${TMDB_API_URL}/3/${type === "movies" ? "movie" : "tv"}/${id}?api_key=${TMDB_API_KEY}&language=en-US`;
        const data = await fetchAPI(url);
        return data ? (type === "movies" ? data.runtime : data.number_of_seasons) : null;
      }),

      video: cache(async ({ type, id }: { type: Type; id: string }) => {
        const url = `${TMDB_API_URL}/3/${type === "movies" ? "movie" : "tv"}/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
        const data = await fetchAPI(url);
        if (!data || !Array.isArray(data.results)) return null;

        const video = data.results.find((vid: any) => (vid.type === "Trailer" || vid.type === "Teaser") && vid.official);
        return video
          ? {
              id: video.id,
              name: video.name,
              key: video.key,
              site: video.site,
              size: video.size,
              type: video.type,
              isOfficial: video.official,
            }
          : null;
      }),

      logo: cache(async ({ type, id }: { type: Type; id: string }) => {
        const url = `${TMDB_API_URL}/3/${type === "movies" ? "movie" : "tv"}/${id}/images?api_key=${TMDB_API_KEY}`;
        const data = await fetchAPI(url);
        if (!data || !Array.isArray(data.logos)) return null;

        const logo = data.logos.find((logo: any) => logo.iso_639_1 === "en");
        return logo
          ? {
              aspectRatio: logo.aspect_ratio,
              width: logo.width,
              height: logo.height,
              image: logo.file_path,
            }
          : null;
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