const axios = require('axios');
const config = require('../config');

Array.prototype.shuffle = function () {
  for (let i = this.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [this[i - 1], this[j]] = [this[j], this[i - 1]]
  }
  return this
}

function discoverMovie(kind, genreId, language) {
  return moviedbApiCall(kind, genreId, language).then(response =>
    apiResultToCarousselle(response.data.results)
  );
}

function moviedbApiCall(kind, genreId, language) {
  return axios.get(`https://api.themoviedb.org/3/discover/${kind}`, {
    params: {
      api_key: config.MOVIEDB_TOKEN,
      sort_by: 'popularity.desc',
      include_adult: false,
      with_genres: genreId,
      with_original_language: language,
    },
  });
}

function apiResultToCarousselle(results) {
  if (results.length === 0) {
    return [
      {
        type: 'quickReplies',
        content: {
          title: 'Sorry, but I could not find any results for your request :(',
          buttons: [{ title: 'Start over', value: 'Start over' }],
        },
      },
    ];
  }

  const cards = results.slice(0, 10).map(e => ({
    title: e.title || e.name,
    subtitle: e.overview,
    imageUrl: `https://image.tmdb.org/t/p/w600_and_h900_bestv2${e.poster_path}`,
    buttons: [
      {
        type: 'web_url',
        value: `https://www.themoviedb.org/movie/${e.id}`,
        title: 'View More',
      },
    ],
  }));

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
    {
      type: 'text',
      content: lastMessage.shuffle()[0],
    },
    { type: 'carousel', content: cards },
    {
      type: 'quickReplies',
      content: {
        title: 'You can change your criterias if you want to!',
        buttons: [{ title: 'Start over', value: 'Start over' }],
      },
    },
  ];
}

module.exports = {
  discoverMovie,
};
