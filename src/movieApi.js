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

const moviedbApiCall = (kind, params) => {
  return Promise.all(
    [1, 2, 3].map(page => axios.get(`https://api.themoviedb.org/3/discover/${kind}`, {
      params: Object.assign({}, {
        api_key: process.env.MOVIEDB_TOKEN,
        sort_by: 'popularity.desc',
        include_adult: false,
        page,
      }, params),
    }))
  ).then(res => res.reduce((sum, currentElem) => sum.concat(currentElem.data.results), []))
}

const discoverMovie = ({ genreId, isoCode, year, interval }) => {
  return moviedbApiCall('movie', {
    with_genres: genreId,
    primary_release_year: year,
    with_original_language: isoCode,
    'primary_release_date.gte': (interval || {}).start,
    'primary_release_date.lte': (interval || {}).end,
  })
    .then((response) => apiResultToCarousselle(response, 'movie'))
}

const discoverTv = ({ genreId, isoCode, year, interval }) => {
  return moviedbApiCall('tv', {
    with_genres: genreId,
    first_air_date_year: year,
    with_original_language: isoCode,
    'air_date.gte': (interval || {}).start,
    'air_date.lte': (interval || {}).end,
  })
    .then((response) => apiResultToCarousselle(response, 'tv'))
}

const apiResultToCarousselle = (results, kind) => {
  const cards = results.shuffle()
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
    return [{
      type: 'quickReplies',
      content: {
        title: 'Sorry, but I could not find any results for your request :(',
        buttons: [{ title: 'Start over', value: 'Start over' }],
      },
    }]
  }

  const lastMessage = [
    'Here\'s what I found for you!',
    'There you go!',
    'There you go, mate!',
    'Here is what I got. I hope you like what I got.',
    'Hope you\'ll like what I found for you! (Not that I really care, I don\'t actually have feelings, just trying to be polite)',
    'This is my selection, but I personally think there are not enough Nicolas Cage movies.\nThere are never enough of Nicolas Cage movies.',
    'This is what I found, but it would have been better if not for your strange tastes.',
    'This is it:',
    'Grab some pop corn and enjoy:',
  ]

  return [
    { type: 'text', content: lastMessage.shuffle()[0] },
    { type: 'carouselle', content: cards },
    {
      type: 'quickReplies',
      content: {
        title: 'You can change your criterias if you want to!',
        buttons: [{ title: 'Start over', value: 'Start over' }],
      },
    },
  ]
}

module.exports = {
  discoverMovie,
  discoverTv,
}
