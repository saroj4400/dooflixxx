export interface Episode {
  id: string;
  season: number;
  episode: number;
  title: string;
  description: string;
  runtime: string;
  videoUrl?: string;
  thumbnail?: string;
  airDate?: string;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface TVShow {
  id: string;
  title: string;
  year: number;
  type: "tv";
  poster: string;
  backdrop: string;
  description: string;
  genres: string[];
  rating: number;
  runtime?: string;
  language: string;
  isNew?: boolean;
  isTopRated?: boolean;
  isTop10?: boolean;
  cast?: string[];
  director?: string;
  maturityRating?: string;
  quality?: string;
  tagline?: string;
  seasons?: Season[];
  numberOfSeasons?: number;
  similarIds?: string[];
}

