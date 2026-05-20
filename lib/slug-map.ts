import mappings from './slug_mappings.json';

export interface SlugEntry {
  tmdb_id: number;
  imdb_id: string;  // e.g. "tt10548174"
  media_type: 'movie' | 'tv';
  title: string;
}

const map = mappings as Record<string, SlugEntry>;

export function lookupSlug(slug: string): SlugEntry | null {
  return map[slug] ?? null;
}

/** Build embed player URLs for a movie */
export function moviePlayerUrls(imdbId: string) {
  return {
    VidSrcIcu: `https://vid.hostapi.top/vidsrcicu.php?id=${imdbId}`,
    'Beta Player': `https://vid.hostapi.top/vidsrcpro.php?id=${imdbId}`,
    VidSrcMe: `https://vid.hostapi.top/vidsrcme.php?id=${imdbId}`,
  };
}

/** Build embed player URLs for a TV episode */
export function tvPlayerUrls(imdbId: string, season: number, episode: number) {
  return {
    VidSrcIcu: `https://vid.hostapi.top/vidsrcicu.php?id=${imdbId}&s=${season}&e=${episode}`,
    'Beta Player': `https://vid.hostapi.top/vidsrcpro.php?id=${imdbId}&s=${season}&e=${episode}`,
    VidSrcMe: `https://vid.hostapi.top/vidsrcme.php?id=${imdbId}&s=${season}&e=${episode}`,
  };
}

/** TMDB genre slug → genre ID (movies) */
export const GENRE_MAP: Record<string, { id: number; label: string; tvId?: number }> = {
  'action':           { id: 28,    label: 'Action',            tvId: 10759 },
  'adventure':        { id: 12,    label: 'Adventure',         tvId: 10759 },
  'animation':        { id: 16,    label: 'Animation',         tvId: 16 },
  'biography':        { id: 36,    label: 'Biography' },
  'comedy':           { id: 35,    label: 'Comedy',            tvId: 35 },
  'crime':            { id: 80,    label: 'Crime',             tvId: 80 },
  'documentary':      { id: 99,    label: 'Documentary',       tvId: 99 },
  'drama':            { id: 18,    label: 'Drama',             tvId: 18 },
  'family':           { id: 10751, label: 'Family',            tvId: 10751 },
  'fantasy':          { id: 14,    label: 'Fantasy',           tvId: 10765 },
  'film-noir':        { id: 80,    label: 'Film-Noir' },
  'game-show':        { id: 10767, label: 'Game Show' },
  'history':          { id: 36,    label: 'History' },
  'horror':           { id: 27,    label: 'Horror' },
  'kids':             { id: 10751, label: 'Kids',              tvId: 10762 },
  'music':            { id: 10402, label: 'Music' },
  'musical':          { id: 10402, label: 'Musical' },
  'mystery':          { id: 9648,  label: 'Mystery',           tvId: 9648 },
  'news':             { id: 10763, label: 'News',              tvId: 10763 },
  'reality':          { id: 10764, label: 'Reality',           tvId: 10764 },
  'reality-tv':       { id: 10764, label: 'Reality TV',        tvId: 10764 },
  'romance':          { id: 10749, label: 'Romance' },
  'sci-fi':           { id: 878,   label: 'Sci-Fi',            tvId: 10765 },
  'sci-fi-fantasy':   { id: 878,   label: 'Sci-Fi & Fantasy',  tvId: 10765 },
  'science-fiction':  { id: 878,   label: 'Science Fiction',   tvId: 10765 },
  'short':            { id: 99,    label: 'Short' },
  'soap':             { id: 10766, label: 'Soap',              tvId: 10766 },
  'sport':            { id: 10770, label: 'Sport' },
  'talk':             { id: 10767, label: 'Talk',              tvId: 10767 },
  'talk-show':        { id: 10767, label: 'Talk Show',         tvId: 10767 },
  'thriller':         { id: 53,    label: 'Thriller' },
  'tv-movie':         { id: 10770, label: 'TV Movie' },
  'war':              { id: 10752, label: 'War',               tvId: 10768 },
  'war-politics':     { id: 10752, label: 'War & Politics',    tvId: 10768 },
  'western':          { id: 37,    label: 'Western',           tvId: 37 },
};

/** Country slug → ISO 3166-1 alpha-2 code */
export const COUNTRY_MAP: Record<string, { code: string; label: string }> = {
  'argentina':      { code: 'AR', label: 'Argentina' },
  'australia':      { code: 'AU', label: 'Australia' },
  'austria':        { code: 'AT', label: 'Austria' },
  'belgium':        { code: 'BE', label: 'Belgium' },
  'brazil':         { code: 'BR', label: 'Brazil' },
  'canada':         { code: 'CA', label: 'Canada' },
  'china':          { code: 'CN', label: 'China' },
  'czech-republic': { code: 'CZ', label: 'Czech Republic' },
  'denmark':        { code: 'DK', label: 'Denmark' },
  'finland':        { code: 'FI', label: 'Finland' },
  'france':         { code: 'FR', label: 'France' },
  'germany':        { code: 'DE', label: 'Germany' },
  'hong-kong':      { code: 'HK', label: 'Hong Kong' },
  'hungary':        { code: 'HU', label: 'Hungary' },
  'india':          { code: 'IN', label: 'India' },
  'ireland':        { code: 'IE', label: 'Ireland' },
  'israel':         { code: 'IL', label: 'Israel' },
  'italy':          { code: 'IT', label: 'Italy' },
  'japan':          { code: 'JP', label: 'Japan' },
  'luxembourg':     { code: 'LU', label: 'Luxembourg' },
  'mexico':         { code: 'MX', label: 'Mexico' },
  'netherlands':    { code: 'NL', label: 'Netherlands' },
  'new-zealand':    { code: 'NZ', label: 'New Zealand' },
  'norway':         { code: 'NO', label: 'Norway' },
  'philippines':    { code: 'PH', label: 'Philippines' },
  'poland':         { code: 'PL', label: 'Poland' },
  'romania':        { code: 'RO', label: 'Romania' },
  'russia':         { code: 'RU', label: 'Russia' },
  'south-africa':   { code: 'ZA', label: 'South Africa' },
  'south-korea':    { code: 'KR', label: 'South Korea' },
  'spain':          { code: 'ES', label: 'Spain' },
  'sweden':         { code: 'SE', label: 'Sweden' },
  'switzerland':    { code: 'CH', label: 'Switzerland' },
  'thailand':       { code: 'TH', label: 'Thailand' },
  'turkey':         { code: 'TR', label: 'Turkey' },
  'united-kingdom': { code: 'GB', label: 'United Kingdom' },
  'united-states':  { code: 'US', label: 'United States' },
};
