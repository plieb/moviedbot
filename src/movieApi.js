const axios = require('axios')

/* eslint-disable camelcase */
/* eslint-disable no-extend-native */
Array.prototype.shuffle = function () {
  for (let i = this.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [this[i - 1], this[j]] = [this[j], this[i - 1]]
  }
  return this
}

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
    .then((response) => apiResultToCarousselle(response, 'movie'))
}

const discoverTv = ({ genreId, isoCode, year, interval }) => {
  return tvApiCall({
    with_genres: genreId,
    first_air_date_year: year,
    with_original_language: isoCode,
    'first_air_date.gte': (interval || {}).start,
    'first_air_date.lte': (interval || {}).end,
  })
    .then((response) => apiResultToCarousselle(response, 'tv'))
}

const apiResultToCarousselle = (response, kind) => {
  const cards = response.data.results.shuffle()
    .slice(0, 10)
    .map(e => ({
      title: e.title || e.name,
      subtitle: e.overview,
      imageUrl: `https://image.tmdb.org/t/p/w640${e.poster_path}`,
      buttons: [{
        type: 'web_url',
        value: `https://www.themoviedb.org/${kind}/${e.id}`,
        title: 'View More',
      }],
    }))

  if (cards.length === 0) {
    return [{ type: 'text', content: 'Sorry, but I could not find any results for your request :(' }]
  }

  const lastMessage = [
    'Here\'s what I found for you!',
    'There you go!',
    'Here is what I got. I hope you like what I got.',
    'This is my selection, but I personally think there are not enough Nicolas Cage movies.\nThere are never enough of Nicolas Cage movies.',
    'This is what I found, but it would have been better if not for your strange tastes.',
  ]

  return [
    { type: 'text', content: lastMessage.shuffle()[0] },
    { type: 'carouselle', content: cards },
  ]
}

module.exports = {
  discoverMovie,
  discoverTv,
}
