<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MovieApiService } from '@/services/tmdb.service'
import { useCollectionStore, type Movie } from '@/stores/collection'

const collection = useCollectionStore()

const currentMovie = ref<Movie | null>(null)
const isLoading = ref(false)
const isNew = ref(false)

const currentTime = ref(Date.now())

const PACKS = {
  classique: {
    label: 'Classique',
    cd: 30 * 1000,
    color: 'bg-white text-black hover:bg-slate-200',
  },
  rare: {
    label: 'Rare',
    cd: 5 * 60 * 1000,
    color: 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-900/20',
  },
  legendaire: {
    label: 'Légendaire',
    cd: 60 * 60 * 1000,
    color: 'bg-yellow-500 text-black hover:bg-yellow-600 shadow-yellow-900/20',
  },
}

const cooldowns = ref({
  classique: Number(localStorage.getItem('cd_classique')) || 0,
  rare: Number(localStorage.getItem('cd_rare')) || 0,
  legendaire: Number(localStorage.getItem('cd_legendaire')) || 0,
})

const getRemainingTime = (type: keyof typeof PACKS) => {
  const diff = cooldowns.value[type] - currentTime.value
  return diff > 0 ? Math.ceil(diff / 1000) : 0
}

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs.toString().padStart(2, '0')}s`
}

onMounted(() => {
  setInterval(() => (currentTime.value = Date.now()), 1000)
})

const handleOpenBooster = async (type: keyof typeof PACKS) => {
  if (isLoading.value || getRemainingTime(type) > 0) return
  isLoading.value = true
  isNew.value = false

  try {
    let maxVote = 5
    if (type === 'rare') maxVote = 4
    if (type === 'legendaire') maxVote = 2

    const movie = await MovieApiService.fetchRandomMovie(maxVote)

    if (movie) {
      isNew.value = !collection.ownedMovies.some((m) => m.id === movie.id)
      currentMovie.value = movie as Movie
      collection.addMovie(currentMovie.value)

      const expiry = Date.now() + PACKS[type].cd
      cooldowns.value[type] = expiry
      localStorage.setItem(`cd_${type}`, expiry.toString())
    }
  } catch (error) {
    console.error('Erreur lors du tirage', error)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 800)
  }
}

const getRarityUI = (note: number) => {
  if (note <= 2) return { label: 'Légendaire', color: 'text-yellow-500' }
  if (note <= 4) return { label: 'Rare', color: 'text-purple-500' }
  return { label: 'Commun', color: 'text-red-500' }
}

const getTmdbLink = (movie: Movie | null) =>
  movie ? `https://www.themoviedb.org/movie/${movie.id}` : '#'
</script>

<template>
  <div
    class="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-black overflow-hidden px-4"
  >
    <div
      class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.1)_0%,_rgba(0,0,0,1)_80%)]"
    ></div>

    <div class="relative z-10 flex flex-col items-center max-w-2xl w-full">
      <div class="text-center mb-10">
        <h2 class="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
          Ouverture de booster
        </h2>
        <p class="text-slate-400 mt-2 font-medium">Tentez d'obtenir une pépite du cinéma</p>
      </div>

      <div class="relative group.cursor-pointer perspective-1000">
        <div
          class="absolute -inset-4 bg-red-600/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
        ></div>

        <div
          class="relative w-64 h-96 md:w-72 md:h-[420px] bg-slate-900 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500"
          :class="{ 'animate-pulse scale-95': isLoading, 'hover:scale-105': !isLoading }"
        >
          <img
            :src="
              currentMovie?.poster_path
                ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`
                : '/src/assets/random.png'
            "
            alt="Film preview"
            class="w-full h-full object-cover transition-opacity duration-500"
            :class="isLoading ? 'opacity-20' : 'opacity-80'"
          />

          <div
            v-if="currentMovie && !isLoading"
            class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent"
          >
            <div class="absolute bottom-95 right-2">
              <span
                v-if="isNew"
                class="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg animate-bounce uppercase tracking-widest"
              >
                NOUVEAU
              </span>
              <span
                v-else
                class="bg-slate-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-widest"
              >
                DOUBLON
              </span>
            </div>

            <span
              :class="[
                'text-[10px] uppercase tracking-[0.2em] font-black',
                getRarityUI(currentMovie?.vote_average ?? 0).color,
              ]"
            >
              Rareté : {{ getRarityUI(currentMovie?.vote_average ?? 0).label }}
            </span>
            <h3 class="text-lg font-bold text-white leading-tight truncate">
              {{ currentMovie?.title }}
            </h3>
          </div>

          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
            <span class="text-white font-black italic animate-bounce">TIRAGE EN COURS...</span>
          </div>
        </div>
      </div>

      <div class="text-lg font-bold text-white leading-tight mt-4 mb-8">
        <a
          v-if="currentMovie && !isLoading"
          :href="getTmdbLink(currentMovie)"
          target="_blank"
          class="hover:text-red-500 transition-colors underline decoration-red-500/30 underline-offset-4"
        >
          voir sur TMdb
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div v-for="(data, type) in PACKS" :key="type" class="flex flex-col items-center">
          <button
            @click="handleOpenBooster(type as keyof typeof PACKS)"
            :disabled="isLoading || getRemainingTime(type as keyof typeof PACKS) > 0"
            :class="[
              'w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all transform active:scale-95 shadow-2xl disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed',
              data.color,
            ]"
          >
            <span v-if="getRemainingTime(type as keyof typeof PACKS) > 0">
              {{ formatTime(getRemainingTime(type as keyof typeof PACKS)) }}
            </span>
            <span v-else>Pack {{ data.label }}</span>
          </button>

          <div class="mt-3 flex items-center gap-2">
            <span
              class="w-2 h-2 rounded-full"
              :class="
                getRemainingTime(type as keyof typeof PACKS) > 0
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-green-500'
              "
            ></span>
            <p class="text-[10px] text-slate-500 uppercase font-black tracking-tighter">
              CD: {{ data.cd / 60000 }} MIN
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
</style>
