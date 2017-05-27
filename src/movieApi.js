const axios = require('axios')

const movieApiCall = (params) => {
	return axios.get('https://api.themoviedb.org/3/discover/movie', {
		params: Object.assign({}, {
			api_key: process.env.MOVIEDB_TOKEN,
			sort_by: 'popularity.desc',
			include_adult: false,
			include_adult: false,
			page: 1,
		}, params),
	})
}

const tvApiCall = (params) => {
	return axios.get('https://api.themoviedb.org/3/discover/tv', {
		params: Object.assign({}, {
			api_key: process.env.MOVIEDB_TOKEN,
			sort_by: 'popularity.desc',
			include_adult: false,
			include_adult: false,
			page: 1,
		}, params),
	})
}

const discoverMovie = (genre) => {
	const genreId = getGenreId(genre)
	if (!genre) {
		return Promise.reject(`Unknown genre: ${genre}`)
	}
	return movieApiCall({ with_genres: genreId })
		.then((response) => apiResultToCarousselle(response))
}

const discoverTv = () => { }

const apiResultToCarousselle = (response) => {
	const cards = response.data.results.map(e => ({
		title: e.title,
		subtitle: e.overview,
		imageUrl: `https://image.tmdb.org/t/p/w640${e.poster_path}`,
		buttons: [{
			type: 'web_url',
			value: `https://www.themoviedb.org/movie/${e.id}`,
			title: 'View More'
		}],
	}))

	return {
		type: 'carouselle',
		content: cards.slice(0, 10),
	}
}

const getGenreId = (genre) => {
	const genreMap = {
		'Action': 28,
		'Adventure': 12,
		'Animation': 16,
		'Comedy': 35,
		'Crime': 80,
		'Documentary': 99,
		'Drama': 18,
		'Family': 10751,
		'Fantasy': 14,
		'History': 36,
		'Horror': 27,
		'Music': 10402,
		'Mystery': 9648,
		'Romance': 10749,
		'Science Fiction': 878,
		'TV Movie': 10770,
		'Thriller': 53,
		'War': 10752,
		'Western': 37,
	}
	return genreMap[genre]
}

module.exports = {
	discoverMovie,
	discoverTv,
}
