<script setup lang="ts">
import { ref } from 'vue'
import { MovieApiService } from '@/services/tmdb.service'
import { useCollectionStore } from '@/stores/collection'

const collection = useCollectionStore()

interface Movie {
  id: number
  title?: string
  poster_path?: string
  vote_average?: number
  [key: string]: unknown
}

const currentMovie = ref<Movie | null>(null)
const isLoading = ref(false)

const handleOpenBooster = async () => {
  if (isLoading.value) return

  isLoading.value = true

  try {
    const movie = await MovieApiService.fetchRandomMovie()
    const typedMovie = movie as Movie
    currentMovie.value = typedMovie

    collection.addMovie(typedMovie)
  } catch (error) {
    console.error("Erreur", error)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 800)
  }
}

const getRarity = (note: number) => {
  if (note <= 2) return { label: 'Légendaire', color: 'text-yellow-500' }
  if (note <= 4) return { label: 'Rare', color: 'text-purple-500' }
  return { label: 'Commun', color: 'text-red-500' }
}

const getTmdbLink = (movie: Movie | null) => {
  if (!movie) return '#'
  return `https://www.themoviedb.org/movie/${movie.id}`
}
</script>

<template>
  <div class="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-black overflow-hidden px-4">
    <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.1)_0%,_rgba(0,0,0,1)_80%)]"></div>

    <div class="relative z-10 flex flex-col items-center max-w-2xl w-full">
      <div class="text-center mb-10">
        <h2 class="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
          Booster classique
        </h2>
        <p class="text-slate-400 mt-2 font-medium">Tentez d'obtenir une pépite du cinéma</p>
      </div>

      <div class="relative group.cursor-pointer perspective-1000">
        <div class="absolute -inset-4 bg-red-600/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>

        <div
          class="relative w-64 h-96 md:w-72 md:h-[420px] bg-slate-900 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500"
          :class="{ 'animate-pulse scale-95': isLoading, 'hover:scale-105': !isLoading }"
        >
          <img
            :src="currentMovie?.poster_path ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}` : '/src/assets/random.png'"
            alt="Film preview"
            class="w-full h-full object-cover transition-opacity duration-500"
            :class="isLoading ? 'opacity-20' : 'opacity-80'"
          />

          <div v-if="currentMovie && !isLoading" class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div class="flex justify-between items-end">
              <div>
                <span :class="['text-[10px] uppercase tracking-widest font-bold', getRarity(currentMovie?.vote_average ?? 0).color]">
                  Rareté : {{ getRarity(currentMovie?.vote_average ?? 0).label }}
                </span>
                <h3 class="text-lg font-bold text-white leading-tight">{{ currentMovie?.title }}</h3>
              </div>
              <div class="bg-red-600 text-white px-2 py-1 rounded text-sm font-black">
                {{ currentMovie?.vote_average }}
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
            <span class="text-white font-black italic animate-bounce">TIRAGE EN COURS...</span>
          </div>
        </div>
      </div>
      <h3 v-if="currentMovie" class="text-lg font-bold text-white leading-tight mt-8">
        <a
          :href="getTmdbLink(currentMovie)"
          target="_blank"
          class="hover:text-red-500 transition-colors underline decoration-red-500/30 underline-offset-4"
        >
          voir sur TMdb
        </a>
      </h3>
      <div class="mt-12 flex flex-col items-center gap-4 w-full">
        <button
          @click="handleOpenBooster"
          :disabled="isLoading"
          class="w-full md:w-auto px-12 py-4 bg-white text-black font-black uppercase rounded-full hover:bg-red-600 hover:text-white transition-all transform active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Ouverture...' : 'Ouvrir' }}
        </button>
      </div>
    </div>
  </div>
</template>
