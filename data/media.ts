import { movies } from "./movies";
import { shows, episodes, getEpisodesForShow } from "./tv";
import { Media } from "@/types/media";

export { movies } from "./movies";
export { shows, episodes, getEpisodesForShow } from "./tv";
export { genres, genreNames, getGenreNameById, getGenreIdByName } from "./genres";

export const allMedia: Media[] = [...movies, ...shows];