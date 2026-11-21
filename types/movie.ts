export interface Movie {
  id: string;
  title: string;
  year: number;
  type: "movie";
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
  similarIds?: string[];
}

