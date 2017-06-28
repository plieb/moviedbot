const axios = require('axios')

/* eslint-disable camelcase */
const movieApiCall = (params) => {
  return axios.get('https://api.themoviedb.org/3/discover/movie', {
    params: Object.assign({}, {
      api_key: process.env.MOVIEDB_TOKEN,
      sort_by: 'popularity.desc',
      include_adult: false,
      page: 1,
    }, params),
  })
}

const tvApiCall = (params) => {
  return axios.get('https://api.themoviedb.org/3/discover/tv', {
    params: Object.assign({}, {
      api_key: process.env.MOVIEDB_TOKEN,
      sort_by: 'popularity.desc',
      include_adult: false,
      page: 1,
    }, params),
  })
}

const discoverMovie = ({ genreId, isoCode, year, interval }) => {
  return movieApiCall({
    with_genres: genreId,
    primary_release_year: year,
    with_original_language: isoCode,
    'primary_release_date.gte': (interval || {}).start,
    'primary_release_date.lte': (interval || {}).end,
  })
    .then((response) => apiResultToCarousselle(response))
}

const discoverTv = ({ genreId, isoCode, year, interval }) => {
  return tvApiCall({
    with_genres: genreId,
    first_air_date_year: year,
    with_original_language: isoCode,
    'first_air_date.gte': (interval || {}).start,
    'first_air_date.lte': (interval || {}).end,
  })
    .then((response) => apiResultToCarousselle(response))
}

const apiResultToCarousselle = (response) => {
  const cards = response.data.results.map(e => ({
    title: e.title || e.name,
    subtitle: e.overview,
    imageUrl: `https://image.tmdb.org/t/p/w640${e.poster_path}`,
    buttons: [{
      type: 'web_url',
      value: `https://www.themoviedb.org/movie/${e.id}`,
      title: 'View More',
    }],
  }))

  if (cards.length === 0) {
    return { type: 'text', content: 'Sorry, but I could not find any results for your request :(' }
  }

  console.log({
    type: 'carouselle',
    content: cards.slice(0, 10),
  })

  return {
    type: 'carouselle',
    content: cards.slice(0, 10),
  }
}

module.exports = {
  discoverMovie,
  discoverTv,
}
