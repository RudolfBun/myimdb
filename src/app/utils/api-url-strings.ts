export class ApiUrlStrings {
  public static readonly API_KEY = '?api_key=1257995ad70b2cd0527901e18398d2e8';
  public static readonly API_BASE_ULR = 'https://api.themoviedb.org/3/';
  public static readonly CONFIG_URL =
    'https://api.themoviedb.org/3/configuration';

  public static readonly DISCOVER = 'discover/movie';
  public static readonly MOVIE = 'movie/';
  public static readonly CREDITS = '/credits';
  public static readonly GENERE_LIST = 'genre/movie/list';
  public static readonly SEARCH_MOVIE = 'search/movie';
  public static readonly QUERY = '&query=';
  public static readonly TOP_RATED = 'movie/top_rated';

  public static readonly LANG_REGION = '&language=en-US&region=hu';
  public static readonly SORT_POPULARITY_DESC = '&sort_by=popularity.desc';
  public static readonly YEAR = '&year=';
  public static readonly CATEGORY = '&with_genres=';

  public static readonly DISCOVER_MOVIE_WITH_PARAM =
    ApiUrlStrings.API_BASE_ULR +
    ApiUrlStrings.DISCOVER +
    ApiUrlStrings.API_KEY +
    ApiUrlStrings.LANG_REGION +
    ApiUrlStrings.SORT_POPULARITY_DESC;

  public static readonly GET_MOVIES_BY_CATEGORY =
    ApiUrlStrings.DISCOVER_MOVIE_WITH_PARAM + ApiUrlStrings.CATEGORY;
  public static readonly GET_MOVIES_BY_YEAR =
    ApiUrlStrings.DISCOVER_MOVIE_WITH_PARAM + ApiUrlStrings.YEAR;

  public static readonly GET_MOVIE_WITHOUT_KEY =
    ApiUrlStrings.API_BASE_ULR + ApiUrlStrings.MOVIE;
  public static readonly GET_CREDITS_PART2 =
    ApiUrlStrings.CREDITS + ApiUrlStrings.API_KEY;
  public static readonly GET_MOVIES_WITH_QUERY =
    ApiUrlStrings.API_BASE_ULR +
    ApiUrlStrings.SEARCH_MOVIE +
    ApiUrlStrings.API_KEY +
    ApiUrlStrings.LANG_REGION +
    ApiUrlStrings.QUERY;

  public static readonly GET_ALL_CATEGORY =
    ApiUrlStrings.API_BASE_ULR +
    ApiUrlStrings.GENERE_LIST +
    ApiUrlStrings.API_KEY;
  public static readonly GET_TOP_RATED =
    ApiUrlStrings.API_BASE_ULR +
    ApiUrlStrings.TOP_RATED +
    ApiUrlStrings.API_KEY +
    ApiUrlStrings.LANG_REGION;

  public static readonly IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
}
