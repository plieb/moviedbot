const axios = require('axios')

const discoverMovie = (params) => {
	return axios.get('https://api.themoviedb.org/3/discover/movie', {
		params: Object.assing({}, {
			api_key: process.env.MOVIEDB_TOKEN,
			sort_by: 'popularity.desc',
			include_adult: false,
			include_adult: false,
			page: 1,
		}, params),
	})
}

const discoverTv = (params) => {
	return axios.get('https://api.themoviedb.org/3/discover/tv', {
		params: Object.assing({}, {
			api_key: process.env.MOVIEDB_TOKEN,
			sort_by: 'popularity.desc',
			include_adult: false,
			include_adult: false,
			page: 1,
		}, params),
	})
}
