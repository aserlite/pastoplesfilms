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
  async fetchRandomMovie() {
    const randomPage = Math.floor(Math.random() * 20) + 1
    const { data } = await instance.get('/discover/movie', {
      params: {
        'vote_average.lte': 5,
        'vote_count.gte': 50,
        page: randomPage,
      },
    })
    console.log(data)
    return data.results[Math.floor(Math.random() * data.results.length)]
  },
}
