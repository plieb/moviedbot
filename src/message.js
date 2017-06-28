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
      if (conversation.action && conversation.action.slug !== 'discover') {
        console.log('The conversation action is: ', conversation.action.slug)

        // We sometime want to reset the memory on some intents
        if (conversation.action.slug === 'greetings' || conversation.action.slug === 'reset') {
          conversation.resetMemory()
            .then(() => console.log('Memory has been reset'))
        }
        if (conversation.action.slug === 'laught') {
          // if the user is laughing, lets send him a funny gif to set up the mood
          message.addReply({ type: 'picture', content: amusedGifs.shuffle()[0] })
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
    return message.reply([{
      type: 'quickReplies',
      content: {
        title: `What genre of ${movie ? 'movies' : 'shows'} do you like?`,
        buttons: [
          { title: 'Action', value: 'Action' },
          { title: 'Comedy', value: 'Comedy' },
          { title: 'Drama', value: 'Drama' },
          { title: 'Family', value: 'Family' },
          { title: 'History', value: 'History' },
          { title: 'Horror', value: 'Horror' },
          { title: 'Romance', value: 'Romance' },
        ],
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
          { title: 'Spanish', value: 'I speak french' },
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

  const genreId = getGenreId(genre.value)
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

const getGenreId = (genre) => {
  const genreMap = {
    Action: 28,
    Adventure: 12,
    Animation: 16,
    Animated: 16,
    Comedy: 35,
    Comedies: 35,
    Crime: 80,
    Documentary: 99,
    Drama: 18,
    Family: 10751,
    Fantasy: 14,
    History: 36,
    Horror: 27,
    Music: 10402,
    Mystery: 9648,
    Romance: 10749,
    Romantic: 10749,
    'Science Fiction': 878,
    'Sci-Fi': 878,
    'TV Movie': 10770,
    Thriller: 53,
    War: 10752,
    Western: 37,
  }
  return genreMap[genre]
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

module.exports = replyMessage
