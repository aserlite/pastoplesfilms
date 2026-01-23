import axios from 'axios'

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY

const instance = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: TMDB_KEY,
    language: 'fr-FR',
  },
})

export const MovieApiService = {
  async fetchRandomMovie(maxVote: number = 5) {
    const randomPage = Math.floor(Math.random() * 20) + 1
    const { data } = await instance.get('/discover/movie', {
      params: {
        'vote_average.lte': maxVote,
        'vote_count.gte': 50,
        page: randomPage,
        include_adult: false,
      },
    })

    if (data.results.length === 0) {
      const retry = await instance.get('/discover/movie', {
        params: { 'vote_average.lte': maxVote, 'vote_count.gte': 20 },
      })
      if (retry.data.results.length === 0) return null
      return retry.data.results[Math.floor(Math.random() * retry.data.results.length)]
    }

    return data.results[Math.floor(Math.random() * data.results.length)]
  },

  async fetchMovieDetails(id: number) {
    const { data } = await instance.get(`/movie/${id}`, {
      params: {
        append_to_response: 'videos',
      },
    })
    return data
  },
}
