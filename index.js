const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');
const loadMovieRoute = require('./discover-movies');

const app = express();
app.use(bodyParser.json());

loadMovieRoute(app);

app.post('/errors', function(req, res) {
  console.log(req.body);
  res.sendStatus(200);
});

const port = config.PORT;
app.listen(port, function() {
  console.log('======================================')
  console.log(`PORT: ${port}`)
  console.log(`MOVIEDB_TOKEN: ${config.MOVIEDB_TOKEN}`)
  console.log('======================================')
  console.log(`App is listening on port ${port}`);
});
