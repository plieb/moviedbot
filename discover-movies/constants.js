const movieGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 16, name: 'Animated' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
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
];

function getGenreId(genre) {
  const row = movieGenres.find(function(elem) {
    return elem.name.toLowerCase() === genre.toLowerCase();
  });

  if (row) {
    return row.id;
  }
  return null;
}

module.exports = {
  movieGenres,
  getGenreId,
};
