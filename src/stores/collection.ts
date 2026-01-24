import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
export interface Movie {
  id: number
  title?: string
  vote_average?: number
  poster_path?: string
  [key: string]: unknown
}

export type Rarity = 'legendaire' | 'rare' | 'commun'

export const useCollectionStore = defineStore('collection', () => {
  const loadFromLocalStorage = (): Movie[] => {
    try {
      const raw = localStorage.getItem('patoplefilm_collection')
      if (!raw) return []
      return JSON.parse(raw) as Movie[]
    } catch {
      return []
    }
  }

  const ownedMovies = ref<Movie[]>(loadFromLocalStorage())

  watch(
    ownedMovies,
    (newVal) => {
      localStorage.setItem('patoplefilm_collection', JSON.stringify(newVal))
    },
    { deep: true },
  )

  const getMovieRarity = (movie: Movie): Rarity => {
    const note = movie.vote_average ?? 0
    if (note <= 2) return 'legendaire'
    if (note <= 4) return 'rare'
    return 'commun'
  }

  const collectionStats = computed(() => {
    return {
      commun: ownedMovies.value.filter((m) => getMovieRarity(m) === 'commun'),
      rare: ownedMovies.value.filter((m) => getMovieRarity(m) === 'rare'),
      legendaire: ownedMovies.value.filter((m) => getMovieRarity(m) === 'legendaire'),
    }
  })

  function hasMovie(id: number): boolean {
    return ownedMovies.value.some((m) => m.id === id)
  }

  function addMovie(movie: Movie) {
    ownedMovies.value.push(movie)
  }

  function receiveGift(giftCode: string): Movie | null {
    try {
      const json = atob(giftCode)
      const movie = JSON.parse(json) as Movie
      if (!movie || !movie.id) return null

      ownedMovies.value.push(movie)

      return movie
    } catch (e) {
      console.error('Cadeau invalide', e)
      return null
    }
  }

  function removeMovie(id: number) {
    ownedMovies.value = ownedMovies.value.filter((m) => m.id !== id)
  }

  function removeSpecificMovies(moviesToRemove: Movie[]) {
    moviesToRemove.forEach((movieToRemove) => {
      const index = ownedMovies.value.indexOf(movieToRemove)

      if (index > -1) {
        ownedMovies.value.splice(index, 1)
      }
    })
  }

  return {
    ownedMovies,
    addMovie,
    collectionStats,
    hasMovie,
    getMovieRarity,
    removeMovie,
    receiveGift,
    removeSpecificMovies,
  }
})
