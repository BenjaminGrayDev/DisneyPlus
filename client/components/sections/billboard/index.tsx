import api from "../../../library/api";
import type { Media } from "../../../types";
import Backdrop from "./backdrop";
import Playback from "./playback";

type Props = {
  media: Media | null; // ✅ Allow `null` to prevent crashing
};

const Billboard = async ({ media }: Props) => {
  if (!media) {
    console.warn("⚠ Billboard: No media found! Showing fallback.");
    return (
      <section className="sticky -z-10 aspect-video max-h-screen w-full overflow-hidden tablet:top-0">
        <div className="flex items-center justify-center h-full w-full bg-gray-900 text-white text-lg">
          No Media Available
        </div>
      </section>
    );
  }

  const { type, id, image } = media;
  const video = type ? await api.get.media.video({ type, id }) : null;

  return (
    <section className="sticky -z-10 aspect-video max-h-screen w-full overflow-hidden tablet:top-0">
      <p className="absolute top-0 right-0 z-20 hidden p-1 text-right text-ms text-typography-light/fade tablet:block">
        Created by: Nikko Abucejo
      </p>
      <div className="relative h-full w-full">
        {video ? (
          <Playback src={`https://www.youtube.com/embed/${video.key}`} />
        ) : null}
        <Backdrop src={image?.backdrop || ""} isAlwaysDisplayed={!!video} />
        <div className="absolute inset-0 z-10 hidden bg-gradient-to-r from-background-dark to-transparent tablet:block" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark to-transparent" />
      </div>
    </section>
  );
};

export default Billboard;
