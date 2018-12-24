const axios = require('axios');
const config = require('../config');

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

  return [
    {
      type: 'text',
      content: "Enjoy the movies 🍿",
    },
    { type: 'carousel', content: cards },
    { type: 'quickreplies', "content": {
      "title": "You can start again a new search",
      "buttons": [
        {
          "title": "Start again",
          "value": "I want to start again"
        }
      ]
    },
  ];
}

module.exports = {
  discoverMovie,
};
