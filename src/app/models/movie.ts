export interface Movie {
  id: number;
  title: string;
  image: string;
  backImage?: string;
  videos?: MovieVideo[];
  description: string;
  rating: number;
  release: string;
  categories: Category[];
  characters: Cast[];
  favorite: boolean;
  alreadySeen: boolean;
  watchlist: boolean;
  numOfVotes: number;
  language: string;
}

export interface Cast {
  id: number;
  order: number;
  character: string;
  name: string;
  profileImage?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

