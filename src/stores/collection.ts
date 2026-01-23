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

  function addMovie(movie: Movie) {
    if (!ownedMovies.value.some((m) => m.id === movie.id)) {
      ownedMovies.value.push(movie)
    }
  }

  function mergeCards(fromRarity: 'commun' | 'rare'): boolean {
    const candidates =
      fromRarity === 'commun' ? collectionStats.value.commun : collectionStats.value.rare
    if (candidates.length < 15) return false
    const idsToRemove = candidates.slice(0, 15).map((m) => m.id)
    ownedMovies.value = ownedMovies.value.filter((m) => !idsToRemove.includes(m.id))
    return true
  }

  return { ownedMovies, addMovie, collectionStats, mergeCards, getMovieRarity }
})
