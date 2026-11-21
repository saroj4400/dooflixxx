import { Movie } from "./movie";
import { TVShow, Episode, Season } from "./tv";
import { PlayerProvider, MoviePlayer, TVPlayer } from "./player";

export type MediaType = "movie" | "tv";

export type Media = Movie | TVShow;

export type { Movie, TVShow, Episode, Season, PlayerProvider, MoviePlayer, TVPlayer };