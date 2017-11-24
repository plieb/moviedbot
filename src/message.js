/*
 * message.js
 * This file contains your bot code
 */

const recastai = require('recastai')
const movieApi = require('./movieApi.js')
const moment = require('moment')

// This function is the core of the bot behaviour
const replyMessage = (message) => {
  // Instantiate Recast.AI SDK, just for request service
  const request = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
  // Get text from message received
  const text = message.content

  console.log('I receive: ', text)

  // Get senderId to catch unique conversation_token
  const senderId = message.senderId

  // Call Recast.AI SDK, through /converse route
  request.converseText(text, { conversationToken: senderId })
    .then(conversation => {
      if (conversation.action) {
        console.log('The conversation action is: ', conversation.action.slug)

        if (conversation.action.slug === 'discover') {
          return startSearchFlow(message, conversation)
        }

        if (conversation.action.slug === 'anything') {
          // Let's just start a search with no criteria
          return movieApi.discoverMovie({})
            .then(carouselle => message.reply(carouselle))
        }

        if (conversation.action.slug === 'such-as' && conversation.getMemory('movie-name')) {
          if (conversation.getMemory('tv')) {
            return movieApi.findShowSimilarTo(conversation.getMemory('movie-name').value)
              .then(carouselle => message.reply(carouselle))
          }
          return movieApi.findMovieSimilarTo(conversation.getMemory('movie-name').value)
            .then(carouselle => message.reply(carouselle))
        }

        // We sometime want to reset the memory on some intents
        if (conversation.action.slug === 'greetings' || conversation.action.slug === 'reset') {
          conversation.resetMemory()
            .then(() => console.log('Memory has been reset'))
        }

        if (conversation.action.slug === 'laught') {
          // if the user is laughing, lets send him a funny gif to set up the mood
          message.addReply({ type: 'picture', content: amusedGifs.shuffle()[0] })
        } else if (conversation.action.slug === 'naughty') {
          // if the user is laughing, lets send him a funny gif to set up the mood
          message.addReply({ type: 'picture', content: shockedGifs.shuffle()[0] })
        } else if (conversation.replies.length > 0) {
          // Add each reply received from API to replies stack
          conversation.replies.forEach(replyContent => message.addReply({ type: 'text', content: replyContent }))
          if (conversation.action.slug === 'ask-joke') {
            // Let's add a funny gif after telling a joke
            message.addReply({ type: 'picture', content: amusedGifs.shuffle()[0] })
          }
        } else {
          // If there is not any message return by Recast.AI for this current conversation
          message.addReply({ type: 'text', content: 'I don\'t have the reply to this yet :)' })
        }

        // Send all replies
        return message.reply()
          .catch(err => {
            console.error('Error while sending message to channel', err)
          })
      }
      // If we don't have an intent for this message, we just want to go through to flow, maybe we'll find some interesting entities!
      // In any case, the user will receive quick replies and it will help him get back on tracks
      return startSearchFlow(message, conversation)
    })
    .catch(err => {
      console.error('Error while sending message to Recast.AI', err)
    })
}

const startSearchFlow = (message, conversation) => {
  const movie = conversation.getMemory('movie')
  const tv = conversation.getMemory('tv')

  const genre = conversation.getMemory('genre')
  const date = conversation.getMemory('datetime')
  const dateInterval = conversation.getMemory('interval')
  const nationality = conversation.getMemory('nationality')
  const language = conversation.getMemory('language')

  if (!movie && !tv) {
    return message.reply([{
      type: 'quickReplies',
      content: {
        title: 'Do you want to watch a movie or a tv show?',
        buttons: [
          { title: 'A movie', value: 'A movie' },
          { title: 'A TV show', value: 'A TV show' },
        ],
      },
    }])
  }

  if (!genre) {
    const buttons = (movie ? movieGenresQuick : tvGenresQuick)
      .shuffle()
      .map(e => ({ title: e.name, value: e.name }))
      .slice(0, 11)
    return message.reply([{
      type: 'quickReplies',
      content: {
        title: `What genre of ${movie ? 'movies' : 'shows'} do you like?`,
        buttons,
      },
    }])
  }

  if (!date && !dateInterval) {
    return message.reply([{
      type: 'quickReplies',
      content: {
        title: 'What year of release?',
        buttons: [
          { title: 'This year', value: 'This year' },
          { title: '2010-2017', value: '2010-2017' },
          { title: '2000-2010', value: '2000-2010' },
          { title: '1980-2000', value: '1980-2000' },
          { title: '1950-1980', value: '1950-1980' },
        ],
      },
    }])
  }

  if (!nationality && !language) {
    return message.reply([{
      type: 'quickReplies',
      content: {
        title: 'Which language?',
        buttons: [
          { title: 'English', value: 'I speak english' },
          { title: 'Spanish', value: 'I speak spanish' },
          { title: 'French', value: 'I speak french' },
          { title: 'German', value: 'I speak german' },
          { title: 'Chinese', value: 'I speak chinese' },
          { title: 'Korean', value: 'I speak korean' },
          { title: 'Japanese', value: 'I speak japanese' },
          { title: 'Portuguese', value: 'I speak portuguese' },
          { title: 'Arabic', value: 'I speak arabic' },
        ],
      },
    }])
  }

  const genreId = getGenreId(genre.value, movie)
  if (!genreId) {
    return message.reply([{ type: 'text', content: `I don't know a genre called "${genre.value}" yet, could you try again ?` }])
      .then(() => conversation.resetMemory('genre'))
  }

  let isoCode = 'en'
  if (language) {
    isoCode = language.short.toLowerCase()
  } else if (nationality) {
    isoCode = nationality.short.toLowerCase()
  }

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

  if (movie) {
    return movieApi.discoverMovie({ genreId, isoCode, year, interval })
      .then(carouselle => message.reply(carouselle))
  }
  return movieApi.discoverTv({ genreId, isoCode, year, interval })
    .then(carouselle => message.reply(carouselle))
}

const movieGenresQuick = [
    { name: 'Action'  },
    { name: 'Adventure'  },
    { name: 'Animation'  },
    { name: 'Comedy'  },
    { name: 'Crime'  },
    { name: 'Documentary'  },
    { name: 'Drama'  },
    { name: 'Family'  },
    { name: 'Fantasy'  },
    { name: 'History'  },
    { name: 'Horror'  },
    { name: 'Music'  },
    { name: 'Mystery'  },
    { name: 'Romance'  },
    { name: 'Science Fiction'  },
    { name: 'TV Movie'  },
    { name: 'Thriller'  },
    { name: 'War'  },
    { name: 'Western'  },
]

const tvGenresQuick = [
    { name: 'Action & Adventure' },
    { name: 'Animation' },
    { name: 'Comedy' },
    { name: 'Crime' },
    { name: 'Documentary' },
    { name: 'Drama' },
    { name: 'Family' },
    { name: 'Kids' },
    { name: 'Mystery' },
    { name: 'News' },
    { name: 'Reality' },
    { name: 'Sci-Fi & Fantasy' },
    { name: 'Soap' },
    { name: 'Talk' },
    { name: 'War & Politics' },
    { name: 'Western' },
]

const movieGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 16, name: 'Animated' },
  { id: 35, name: 'Comedy' },
  { id: 35, name: 'Funny' },
  { id: 35, name: 'Teenage' },
  { id: 35, name: 'High School' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10751, name: 'Christmas' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 36, name: 'True' },
  { id: 36, name: 'Biopic' },
  { id: 27, name: 'Horror' },
  { id: 27, name: 'Scary' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 10749, name: 'Romantic' },
  { id: 878, name: 'Science Fiction' },
  { id: 878, name: 'Sci-Fi' },
  { id: 878, name: 'Sci Fi' },
  { id: 878, name: 'SF' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
]

const tvGenres = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 10759, name: 'Action' },
  { id: 16, name: 'Animation' },
  { id: 16, name: 'Animated' },
  { id: 35, name: 'Comedy' },
  { id: 35, name: 'Romance' },
  { id: 35, name: 'Romantic' },
  { id: 80, name: 'Crime' },
  { id: 80, name: 'Thriller' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10765, name: 'Fantasy' },
  { id: 10765, name: 'Science Fiction' },
  { id: 10765, name: 'Sci-Fi' },
  { id: 10765, name: 'Sci Fi' },
  { id: 10765, name: 'SF' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
]

const getGenreId = (genre, movie) => {
  if (movie) {
    return (
      movieGenres.find(elem => elem.name === genre)
      || {}
    ).id
  } else {
    return (
      tvGenres.find(elem => elem.name === genre)
      || {}
    ).id
  }
}

const amusedGifs = [
  'http://www.reactiongifs.com/r/tumblr_n254pmd7R81qfo87uo2_250.gif',
  'http://www.reactiongifs.com/r/bml.gif',
  'http://www.reactiongifs.com/r/bstngp.gif',
  'https://media.giphy.com/media/xUPOqrl3x2SkKjE3Is/giphy.gif',
  'https://media.giphy.com/media/jQmVFypWInKCc/giphy.gif',
  'https://media.giphy.com/media/3NtY188QaxDdC/giphy.gif',
  'https://media.giphy.com/media/ZqlvCTNHpqrio/giphy.gif',
  'http://www.reactiongifs.com/wp-content/uploads/2013/06/giggle.gif',
  'http://www.reactiongifs.com/wp-content/uploads/2013/06/brick-lol.gif',
  'http://www.reactiongifs.com/r/scbu.gif',
  'http://www.reactiongifs.com/r/jorlol.gif',
  'http://www.reactiongifs.com/r/rofl.gif',
  'http://www.reactiongifs.com/r/shaq.gif',
  'http://www.reactiongifs.com/wp-content/uploads/2013/09/tee-hee.gif',
]

const shockedGifs = [
  'http://www.reactiongifs.com/r/lolof1.gif',
  'http://www.reactiongifs.com/wp-content/uploads/2013/09/tee-hee.gif',
  'http://www.reactiongifs.com/wp-content/uploads/2012/12/BradshawOMG.gif',
  'https://media.giphy.com/media/pnPfFgZi3lnO/giphy.gif',
  'https://media.giphy.com/media/YlPeYXasYEPpC/giphy.gif',
  'http://www.reactiongifs.com/r/jwdrp.gif',
  'http://www.reactiongifs.com/r/gsp.gif',
  'http://www.reactiongifs.com/r/Shocked.gif',
  'http://www.reactiongifs.com/wp-content/uploads/2013/10/miley-omg.gif',
  'http://www.reactiongifs.com/wp-content/uploads/2013/09/colbert-jaw-drop.gif',
  'https://media.giphy.com/media/l3vRo7sVkDkOQsULu/giphy.gif',
  'https://media.giphy.com/media/PGg4D8lGwRz0s/giphy.gif',
  'https://media.giphy.com/media/Xrb2vgFzLKMso/giphy.gif',
  'https://media.giphy.com/media/3oKIPrljOVYppIrRcY/giphy.gif',
]

module.exports = replyMessage
