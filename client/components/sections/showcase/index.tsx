import Image from "next/image";
import api from "../../../library/api";
import type { Media } from "../../../types";
import Button from "../../elements/button";
import convertLanguage from "../../../helpers/convert-language";
import humanizeRuntime from "../../../helpers/humanize-runtime";

type Props = {
  media: Media | null; // ✅ Allow `null` to prevent crashing
  isMediaSelected: boolean;
};

const Showcase = async ({ media, isMediaSelected }: Props) => {
  if (!media) {
    console.warn("⚠ Showcase: No media found! Showing fallback.");
    return (
      <section className="space-y-6 tablet:max-w-md">
        <div className="flex items-center justify-center h-full w-full bg-gray-900 text-white text-lg">
          No Media Available
        </div>
      </section>
    );
  }

  const { type, id, image, title, releasedAt, overview, isForAdult, language } = media;
  const logo = type ? await api.get.media.logo({ type, id }) : null;
  const measure = type && await api.get.media.measure ? await api.get.media.measure({ type, id }) : "N/A";
  const lang = language?.original ? convertLanguage(language.original) : { en: { name: "English" } };

  return (
    <section className="space-y-6 tablet:max-w-md">
      {/* Logo */}
      <div className="relative tablet:aspect-square">
        <div
          style={{
            aspectRatio: logo?.aspectRatio ? logo?.aspectRatio : "1.84 / 1",
          }}
          className="relative bottom-0 max-h-56 w-full tablet:absolute">
          <Image
            src={logo ? `https://image.tmdb.org/t/p/w500${logo.image}` : "/assets/images/disney-plus-logo.png"}
            alt={title || "Unknown Title"}
            fill
            sizes="500px"
            priority
            className="object-contain"
          />
        </div>
      </div>
      <div className="space-y-4">
        {/* Details */}
        <div className="flex items-center gap-1 text-xs tablet:text-base">
          <p className="font-semibold">
            {releasedAt?.slice(0, 4) || "New"} • {type === "movies" ? humanizeRuntime(measure) : `${measure} Seasons`} • {lang?.en?.name || "Unknown Language"} •
          </p>
          <div className="rounded bg-rated-dark px-2 py-0.5 font-semibold tablet:py-0">
            {isForAdult ? "18+" : "PG"}
          </div>
        </div>
        {/* Overview */}
        <div className="overflow-y-auto scrollbar-none tablet:max-h-12">
          <p className="text-xs tablet:text-base">{overview || "No description available."}</p>
        </div>
      </div>
      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant={{
            name: "primary",
            type: "watch",
            isInverted: isMediaSelected,
          }}
          isFull>
          Watch Now
        </Button>
        <Button
          variant={{
            name: "primary",
            type: "save",
            isInverted: false,
          }}
        />
      </div>
    </section>
  );
};

export default Showcase;
