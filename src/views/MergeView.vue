<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCollectionStore, type Movie } from '@/stores/collection'
import { MovieApiService } from '@/services/tmdb.service'

const collection = useCollectionStore()
const isMerging = ref(false)
const mergedMovie = ref<Movie | null>(null)

const isModalOpen = ref(false)
const targetRarity = ref<'commun' | 'rare' | null>(null)
const selectedMovies = ref<Movie[]>([])

const currentPage = ref(1)
const itemsPerPage = 24

const stats = computed(() => collection.collectionStats)

const allAvailableMovies = computed(() => {
  if (!targetRarity.value) return []

  return collection.ownedMovies.filter((m) => {
    const note = m.vote_average ?? 0
    if (targetRarity.value === 'commun') return note > 4
    if (targetRarity.value === 'rare') return note > 2 && note <= 4
    return false
  })
})

const paginatedMovies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return allAvailableMovies.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(allAvailableMovies.value.length / itemsPerPage))

watch(isModalOpen, (isOpen) => {
  if (isOpen) currentPage.value = 1
})


const openSelectionModal = (rarity: 'commun' | 'rare') => {
  targetRarity.value = rarity
  selectedMovies.value = []
  isModalOpen.value = true
  mergedMovie.value = null
}

const toggleMovieSelection = (movie: Movie) => {
  const index = selectedMovies.value.indexOf(movie)

  if (index >= 0) {
    selectedMovies.value.splice(index, 1)
  } else {
    if (selectedMovies.value.length < 15) {
      selectedMovies.value.push(movie)
    }
  }
}

const isSelected = (movie: Movie) => {
  return selectedMovies.value.includes(movie)
}

const confirmMerge = async () => {
  if (selectedMovies.value.length !== 15 || !targetRarity.value) return
  if (isMerging.value) return

  isMerging.value = true
  isModalOpen.value = false

  collection.removeSpecificMovies(selectedMovies.value)

  try {
    const targetMaxVote = targetRarity.value === 'commun' ? 4 : 2

    await new Promise((r) => setTimeout(r, 1000))

    const movie = await MovieApiService.fetchRandomMovie(targetMaxVote)

    if (movie) {
      mergedMovie.value = movie as Movie
      collection.addMovie(mergedMovie.value)
    }
  } catch (error) {
    console.error('Erreur fusion', error)
  } finally {
    isMerging.value = false
    selectedMovies.value = []
  }
}

const getRarityUI = (note: number) => {
  if (note <= 2) return { label: 'Légendaire', color: 'text-yellow-500' }
  if (note <= 4) return { label: 'Rare', color: 'text-purple-500' }
  return { label: 'Commun', color: 'text-red-500' }
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-black p-6 md:p-10 flex flex-col items-center relative">
    <div class="max-w-4xl w-full text-center mb-12">
      <h2 class="text-5xl font-black text-white uppercase italic tracking-tighter">
        Fusion des films
      </h2>
      <p class="text-slate-400 mt-2">Sacrifiez 15 films pour en obtenir un plus horrible</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mb-12">
      <div
        class="bg-slate-900/50 border-2 border-slate-800 p-8 rounded-3xl flex flex-col items-center gap-6"
      >
        <div class="text-center">
          <img
            src="../assets/phase_2_mr_incredible.webp"
            alt="mr incredible"
            class="w-32 h-32 mx-auto object-contain"
          />
          <h3 class="text-xl font-bold text-white mt-2 uppercase">Rare</h3>
          <p class="text-slate-500 text-sm">Convertit 15 Communs</p>
        </div>
        <div class="flex items-center gap-4 text-2xl font-black">
          <span class="text-red-500">{{ stats.commun.length }}</span>
          <span class="text-slate-700">/</span>
          <span class="text-slate-400">15</span>
        </div>
        <button
          @click="openSelectionModal('commun')"
          :disabled="stats.commun.length < 15 || isMerging"
          class="w-full py-4 border-4 border-purple-500 rounded-full font-black uppercase text-purple-500 transition-all hover:bg-purple-500 hover:text-white active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
        >
          Choisir les sacrifices
        </button>
      </div>

      <div
        class="bg-slate-900/50 border-2 border-slate-800 p-8 rounded-3xl flex flex-col items-center gap-6"
      >
        <div class="text-center">
          <img
            src="../assets/phase_4_mr_incredible.webp"
            alt="mr incredible"
            class="w-32 h-32 mx-auto object-contain"
          />
          <h3 class="text-xl font-bold text-white mt-2 uppercase">Légendaire</h3>
          <p class="text-slate-500 text-sm">Convertit 15 Rares</p>
        </div>

        <div class="flex items-center gap-4 text-2xl font-black">
          <span class="text-purple-500">{{ stats.rare.length }}</span>
          <span class="text-slate-700">/</span>
          <span class="text-slate-400">15</span>
        </div>

        <button
          @click="openSelectionModal('rare')"
          :disabled="stats.rare.length < 15 || isMerging"
          class="w-full py-4 border-4 border-yellow-500 rounded-full font-black uppercase text-yellow-500 transition-all hover:bg-yellow-500 hover:text-black active:scale-95 disabled:opacity-20 disabled:border-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
        >
          Choisir les sacrifices
        </button>
      </div>
    </div>

    <div
      v-if="mergedMovie || isMerging"
      class="mt-8 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700"
    >
      <div class="text-white font-black uppercase tracking-widest mb-6 text-xl">
        {{ isMerging ? 'Fusion en cours...' : 'Résultat de la fusion' }}
      </div>
      <div
        class="relative w-64 h-96 md:w-72 md:h-[420px] bg-slate-900 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500"
        :class="{
          'animate-pulse scale-95 border-purple-500/50': isMerging,
          'hover:scale-105 hover:border-white/20': !isMerging,
        }"
      >
        <img
          :src="
            mergedMovie?.poster_path
              ? `https://image.tmdb.org/t/p/w500${mergedMovie.poster_path}`
              : '@/assets/random.png'
          "
          class="w-full h-full object-cover transition-opacity duration-500"
          :class="isMerging ? 'opacity-20' : 'opacity-80'"
        />

        <div
          v-if="mergedMovie && !isMerging"
          class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent"
        >
          <span
            :class="[
              'text-[10px] uppercase tracking-[0.2em] font-black',
              getRarityUI(mergedMovie?.vote_average ?? 0).color,
            ]"
          >
            {{ getRarityUI(mergedMovie?.vote_average ?? 0).label }}
          </span>
          <h3 class="text-lg font-bold text-white leading-tight truncate">
            {{ mergedMovie?.title }}
          </h3>
        </div>
        <button
          v-if="!isMerging"
          @click="mergedMovie = null"
          class="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
        >
          ✖
        </button>
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="p-6 border-b border-white/10 flex justify-between items-center bg-black shrink-0">
        <div>
          <h3 class="text-2xl font-black text-white uppercase italic">
            Sélectionner <span class="text-red-600">15</span> films
          </h3>
          <p class="text-slate-400 text-sm">
            Sélectionnés : <span class="text-white font-bold">{{ selectedMovies.length }}</span> /
            15
          </p>
        </div>
        <button
          @click="isModalOpen = false"
          class="text-slate-500 hover:text-white uppercase font-bold text-sm"
        >
          Annuler
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          <div
            v-for="(movie, index) in paginatedMovies"
            :key="`${movie.id}-${index}`"
            @click="toggleMovieSelection(movie)"
            class="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer transition-all duration-150 group"
            :class="
              isSelected(movie)
                ? 'ring-4 ring-green-500 scale-95 opacity-100'
                : 'opacity-60 hover:opacity-100 hover:scale-105'
            "
          >
            <img
              loading="lazy"
              :src="movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/src/assets/random.png'"
              class="w-full h-full object-cover"
            />

            <div
              v-if="isSelected(movie)"
              class="absolute inset-0 bg-green-500/20 flex items-center justify-center"
            >
              <div class="bg-green-500 text-black rounded-full p-1 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="4" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-white/10 bg-black flex flex-col gap-4 shrink-0">
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 text-white">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>
          <span class="font-mono text-sm">Page {{ currentPage }} / {{ totalPages }}</span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant →
          </button>
        </div>

        <div class="flex justify-center">
          <button
            @click="confirmMerge"
            :disabled="selectedMovies.length !== 15"
            class="w-full md:w-auto px-12 py-4 rounded-full font-black uppercase tracking-widest transition-all"
            :class="
              selectedMovies.length === 15
                ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            "
          >
            CONFIRMER LE SACRIFICE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
