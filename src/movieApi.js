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

const discoverMovie = (genreId, isoCode, year) => {
  return movieApiCall({
    with_genres: genreId,
    primary_release_year: year,
    with_original_language: isoCode,
  })
    .then((response) => apiResultToCarousselle(response))
}

const discoverTv = (genreId, isoCode, year) => {
  return tvApiCall({
    with_genres: genreId,
    primary_release_year: year,
    with_original_language: isoCode,
  })
    .then((response) => apiResultToCarousselle(response))
}

const apiResultToCarousselle = (response) => {
  const cards = response.data.results.map(e => ({
    title: e.title,
    subtitle: e.overview,
    imageUrl: `https://image.tmdb.org/t/p/w640${e.poster_path}`,
    buttons: [{
      type: 'web_url',
      url: `https://www.themoviedb.org/movie/${e.id}`,
      title: 'View More',
    }],
  }))

  if (cards.length === 0) {
    return { type: 'text', content: 'Sorry, but I could not find any results for your request :(' }
  }

  return {
    type: 'carouselle',
    content: cards.slice(0, 10),
  }
}

module.exports = {
  discoverMovie,
  discoverTv,
}
