import { TVShow, Episode } from "@/types/tv";

export const getEpisodesForShow = (showId: string, count: number = 8): Episode[] => {
  const titles = [
    "Pilot: Point of Departure",
    "First Blood",
    "Into the Abyss",
    "Ghost in the System",
    "The Broken Ring",
    "Silent Watcher",
    "Point of No Return",
    "The Reckoning"
  ];

  const thumbs = [
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop"
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `${showId}-s1-e${i + 1}`,
    season: 1,
    episode: i + 1,
    title: titles[i % titles.length] || `Episode ${i + 1}`,
    description: `A critical revelation unfolds as the investigation deepens and stakes escalate beyond containment.`,
    runtime: `${44 + ((i * 3) % 11)}m`,
    thumbnail: thumbs[i % thumbs.length]
  }));
};

export const shows: TVShow[] = [
  {
    id: "reacher",
    title: "Reacher",
    year: 2024,
    type: "tv",
    poster: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1920&auto=format&fit=crop",
    description: "A former military police investigator drifts across the country taking odd jobs, but wherever he arrives, trouble and corruption follow.",
    tagline: "Size does matter. So does justice.",
    genres: ["Action", "Adventure", "Crime"],
    rating: 8.1,
    runtime: "3 Seasons",
    language: "English",
    maturityRating: "TV-MA",
    quality: "4K Ultra HD",
    director: "Nick Santora",
    cast: ["Alan Ritchson", "Malcolm Goodwin", "Willa Fitzgerald"],
    isTopRated: true,
    isTop10: true,
    seasons: [
      { seasonNumber: 1, title: "Season 1", episodes: getEpisodesForShow("reacher", 8) },
      { seasonNumber: 2, title: "Season 2", episodes: getEpisodesForShow("reacher", 8) }
    ]
  },
  {
    id: "silo",
    title: "Silo",
    year: 2024,
    type: "tv",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=1920&auto=format&fit=crop",
    description: "In a ruined and toxic future, thousands live in a giant silo deep underground. When its sheriff breaks a cardinal rule, residents die mysteriously.",
    tagline: "If the lies don't kill you, the truth will.",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    rating: 8.1,
    runtime: "2 Seasons",
    language: "English",
    maturityRating: "TV-MA",
    quality: "4K Ultra HD",
    director: "Graham Yost",
    cast: ["Rebecca Ferguson", "Common", "Tim Robbins"],
    isTopRated: true,
    isTop10: true,
    seasons: [
      { seasonNumber: 1, title: "Season 1", episodes: getEpisodesForShow("silo", 8) },
      { seasonNumber: 2, title: "Season 2", episodes: getEpisodesForShow("silo", 8) }
    ]
  },
  {
    id: "ncis",
    title: "NCIS",
    year: 2024,
    type: "tv",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1920&auto=format&fit=crop",
    description: "Special Agent Leroy Jethro Gibbs leads an eclectic team of special investigators solving crimes with ties to Navy and Marine Corps personnel.",
    tagline: "Always follow Rule #1.",
    genres: ["Crime", "Drama", "Action"],
    rating: 7.8,
    runtime: "21 Seasons",
    language: "English",
    maturityRating: "TV-14",
    quality: "HD",
    director: "Donald P. Bellisario",
    cast: ["Mark Harmon", "Sean Murray", "Wilmer Valderrama"],
    seasons: [
      { seasonNumber: 1, title: "Season 1", episodes: getEpisodesForShow("ncis", 8) }
    ]
  },
  {
    id: "law-order",
    title: "Law & Order: SVU",
    year: 2024,
    type: "tv",
    poster: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1920&auto=format&fit=crop",
    description: "Captain Olivia Benson and her elite squad of the Special Victims Unit investigate vicious crimes in the bustling heart of New York City.",
    tagline: "In the criminal justice system...",
    genres: ["Crime", "Drama", "Mystery"],
    rating: 8.0,
    runtime: "25 Seasons",
    language: "English",
    maturityRating: "TV-14",
    quality: "HD",
    director: "Dick Wolf",
    cast: ["Mariska Hargitay", "Ice-T", "Peter Scanavino"],
    seasons: [
      { seasonNumber: 1, title: "Season 1", episodes: getEpisodesForShow("law-order", 8) }
    ]
  },
  {
    id: "lanterns",
    title: "Lanterns",
    year: 2026,
    type: "tv",
    poster: "https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=800&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop",
    description: "Two legendary peacekeepers are drawn into a terrestrial mystery with cosmic implications in the dark pine forests of the heartland.",
    tagline: "Beware the dark.",
    genres: ["Mystery", "Drama", "Sci-Fi"],
    rating: 7.9,
    runtime: "1 Season",
    language: "English",
    maturityRating: "TV-MA",
    quality: "4K Ultra HD",
    director: "Chris Mundy",
    cast: ["Kyle Chandler", "Aaron Pierre", "Kelly Macdonald"],
    isNew: true,
    isTop10: true,
    seasons: [
      { seasonNumber: 1, title: "Season 1", episodes: getEpisodesForShow("lanterns", 8) }
    ]
  },
  {
    id: "simpsons",
    title: "The Simpsons",
    year: 2024,
    type: "tv",
    poster: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1920&auto=format&fit=crop",
    description: "The satirical adventures of a working-class family in the misfit town of Springfield, capturing decades of pop culture humor.",
    tagline: "America's favorite family.",
    genres: ["Comedy", "Animation"],
    rating: 8.7,
    runtime: "35 Seasons",
    language: "English",
    maturityRating: "TV-PG",
    quality: "HD",
    director: "Matt Groening",
    cast: ["Dan Castellaneta", "Julie Kavner", "Nancy Cartwright"],
    isTopRated: true,
    seasons: [
      { seasonNumber: 1, title: "Season 1", episodes: getEpisodesForShow("simpsons", 8) }
    ]
  },
  {
    id: "crown-dynasty",
    title: "Crown & Dynasty",
    year: 2025,
    type: "tv",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1920&auto=format&fit=crop",
    description: "An intricate saga of royalty, political betrayal, and the heavy price of wearing the sovereign crown in post-war Europe.",
    tagline: "Heavy lies the head.",
    genres: ["Drama", "History"],
    rating: 8.6,
    runtime: "4 Seasons",
    language: "English",
    maturityRating: "TV-MA",
    quality: "4K Ultra HD",
    director: "Peter Morgan",
    cast: ["Claire Foy", "Matt Smith", "Vanessa Kirby"],
    isTopRated: true,
    isTop10: true,
    seasons: [
      { seasonNumber: 1, title: "Season 1", episodes: getEpisodesForShow("crown-dynasty", 8) },
      { seasonNumber: 2, title: "Season 2", episodes: getEpisodesForShow("crown-dynasty", 8) }
    ]
  }
];

export const episodes: Episode[] = getEpisodesForShow("reacher", 8);
