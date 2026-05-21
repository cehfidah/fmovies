export interface Movie {
  id: number;
  title: string;
  name?: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  media_type?: 'movie' | 'tv';
  popularity: number;
  runtime?: number;
  number_of_seasons?: number;
  status?: string;
  tagline?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  featured_image: string | null;
  published: boolean;
  category: string | null;
  tags: string | null;
  author: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface AdminUser {
  id: number;
  username: string;
}
