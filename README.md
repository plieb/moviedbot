[hyperlink]: https://m.me/moviedbot
[image]: https://github.com/plieb/moviedbot/blob/master/assets/messenger.png (Talk to Moviedbot)

[logo]: https://github.com/plieb/moviedbot/blob/master/assets/OBAW%20-%20Week%200x0009.png "The Movie DB + Recast.AI"
![The Movie DB + Recast.AI][logo]

This bot is part of the #[OBAW Github](https://github.com/plieb/OBAW) project - Week 0x0009 - The Movie DB

Medium publication project page #[OBAW Medium](https://medium.com/the-obaw-project)

Medium publication The Movie DB project #[OBAW The Movie DB](https://onebotaweek.com/obaw-project-week-0x0009-the-movie-db-6558b1c6167b)

# The Movie DB Bot for Facebook Messenger using Recast.AI

A [Movie DB](https://www.themoviedb.org/)-powered bot using [Recast.AI](https://recast.ai) NLP

Follow the instructions below to create your own instance of the bot:

## Step 1: Deploy the Bot

1. Make sure you are logged in to the [Heroku Dashboard](https://dashboard.heroku.com/)
1. Click the button below to deploy the Messenger bot on Heroku:

    [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

1. Fill in the config variables as described.

    - For **LANGUAGE** put 'en'
    - For **REQUEST_TOKEN** blank for now (filled at step 2)
    - For **MOVIEDB_TOKEN** blank for now (filled at step 4)

## Step 2: Get your Recast.AI bot

1. Make sure you are logged in to your [Recast.AI account](https://recast.ai/)
1. Follow this link [Moviedbot](https://recast.ai/recast-ai/moviedbot/train) and fork the bot to your account
1. Copy paste your `bot request access token` in the **Config Variables** section of your Heroku app to `REQUEST_TOKEN`

## Step 3: Connect your bot to Messenger

1. Go to your **RUN** tab
1. Click the **Bot Connector** tab and follow instructions to add a Messenger channel
1. Once it's done at the top set your **Current bot webhook** to :
    - Heroku URL + **/webhook** (MY_HEROKU_URL.heroku.com/webhook)

## Step 4: Get your The Movie DB API key

1. Make sure you are logged in to your [The Movie DB account](https://www.themoviedb.org/login?language=en)
1. Follow this link [The Movie DB API](https://developers.themoviedb.org/3/getting-started) and follow the steps to get your API key
1. Paste your `API Key` in the **Config Variables** section of your Heroku app to `MOVIEDB_TOKEN`

[![Talk to The Movie DB bot][image]][hyperlink]

## Authors

PE Lieb [@liebpe](https://twitter.com/liebpe)

Nathan Grasset [@Nathan_Grasset](https://twitter.com/Nathan_Grasset)

You can follow us on Twitter at [@recastai](https://twitter.com/recastai) for updates and releases.

## Special thanks

- [The Movie DB API](https://developers.themoviedb.org)

## License

Copyright (c) [2017] [Recast.AI](https://recast.ai)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

