export interface Movie {
  id: number;
  title: string;
  image: string;
  descreption: string;
  rating: number;
  release: string;
  categories: Category[];
  characters: Cast[];
  favorite: boolean;
  alreadySeen: boolean;
  watchlist: boolean;
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
