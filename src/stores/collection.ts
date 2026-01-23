import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

interface Movie {
  id: number
  title?: string
  [key: string]: unknown
}

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

  watch(ownedMovies, (newVal) => {
    try {
      localStorage.setItem('patoplefilm_collection', JSON.stringify(newVal))
    } catch {

    }
  }, { deep: true })

  function addMovie(movie: Movie) {
    const exists = ownedMovies.value.some(m => m.id === movie.id)
    if (!exists) {
      ownedMovies.value.push(movie)
    }
  }

  return { ownedMovies, addMovie }
})
