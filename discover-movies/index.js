const config = require('../config');
const movieApi = require('./movieApi.js');
const constants = require('./constants');
const moment = require('moment');


function loadMovieRoute(app) {
  app.post('/discover-movies', function(req, res) {
    console.log('[GET] /discover-movies');
    const conversation = req.body.conversation;
    const nlp = req.body.nlp;
    console.log('======================================')
    console.log(`Skill: ${conversation.skill}`)
    console.log('======================================')

    if (conversation.skill === 'anything') {
      // Let's just start a search with no criteria
      return movieApi.discoverMovie({})
        .then(function(carouselle) {
          res.json({
            replies: carouselle,
          });
        })
        .catch(function(err) {
          console.error('movieApi::discoverMovie error: ', err);
        });
    } else if (conversation.skill === 'discover') {
      //Getting memory values
      const movie = conversation.memory['movie'];
      const tv = conversation.memory['tv'];
      const kind = tv ? 'tv' : 'movie';

      const genre = conversation.memory['genre'];
      const genreId = constants.getGenreId(genre.value);

      const language = conversation.memory['language'];
      const nationality = conversation.memory['nationality'];
      const isoCode = language
        ? language.short.toLowerCase()
        : nationality.short.toLowerCase();

      const dateInterval = conversation.memory['interval']
      const date = conversation.memory['datetime']
      let year = null
      let interval = null
      if (date) {
        year = moment(date.iso).year()
      }
      if (dateInterval) {
        interval = {
          begin: moment(dateInterval.begin).format('YYYY-MM-DD'),
          end: moment(dateInterval.end).format('YYYY-MM-DD'),
        }
      }

      if (kind === 'movie') {
        console.log('======================================')
        console.log('Discover movie')
        console.log('======================================')
        return movieApi.discoverMovie({ genreId, isoCode, year, interval })
          .then(function(carouselle) {
            res.json({
              replies: carouselle,
            });
          })
          .catch(function(err) {
            console.error('movieApi::discoverMovie error: ', err);
          });
      }
      console.log('======================================')
      console.log('Discover tv')
      console.log('======================================')
      return movieApi.discoverTv({ genreId, isoCode, year, interval })
        .then(function(carouselle) {
          res.json({
            replies: carouselle,
          });
        })
        .catch(function(err) {
          console.error('movieApi::discoverMovie error: ', err);
        });
    } else if (conversation.skill === 'such-as' && nlp.entities['movie-name']) {
      if (nlp.entities.tv) {
        console.log('======================================')
        console.log('Such as in tv')
        console.log('======================================')
        return movieApi.findShowSimilarTo(nlp.entities['movie-name'][0].value)
          .then(function(carouselle) {
            res.json({
              replies: carouselle,
            });
          })
          .catch(function(err) {
            console.error('movieApi::discoverMovie error: ', err);
          });
      }
      console.log('======================================')
      console.log('Such as in movie')
      console.log('======================================')
      return movieApi.findMovieSimilarTo(nlp.entities['movie-name'][0].value)
        .then(function(carouselle) {
        res.json({
          replies: carouselle,
        });
      })
      .catch(function(err) {
        console.error('movieApi::discoverMovie error: ', err);
      });
    } else {
      return res.json({
        replies: [{type: 'text', content: 'Can not help you with this right now'}],
      });
    }
  });
}

module.exports = loadMovieRoute;
