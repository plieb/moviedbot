/*
 * message.js
 * This file contains your bot code
 */

const recastai = require('recastai')
const movieApi = require('./movieApi.js')

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
    .then(result => {
      if (result.action && result.action.slug !== 'discover') {
        console.log('The conversation action is: ', result.action.slug)
        // If there is not any message return by Recast.AI for this current conversation
        if (!result.replies.length) {
          message.addReply({ type: 'text', content: 'I don\'t have the reply to this yet :)' })
        } else {
          // Add each reply received from API to replies stack
          result.replies.forEach(replyContent => message.addReply({ type: 'text', content: replyContent }))
        }

        // Send all replies
        return message.reply()
          .catch(err => {
            console.error('Error while sending message to channel', err)
          })
      }
      return startSearchFlow(message, result);
    })
    .catch(err => {
      console.error('Error while sending message to Recast.AI', err)
    })
}

const startSearchFlow = (message, conversation) => {
  console.log('Im in search flow!')
  const genre = conversation.getMemory('genre')
  // annee
  // location / country / language
  if (genre) {
    return movieApi.discoverMovie(genre.value)
      .then(carouselle => message.reply([carouselle])
        .catch(err => {
          console.error('Error while sending message to channel', err)
        })
      )
  } else {
    console.log('hehe')
    return message.reply([{ type: 'text', content: 'Give me a genre !' }])
  }
}

module.exports = replyMessage
