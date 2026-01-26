<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCollectionStore } from '@/stores/collection'

const collection = useCollectionStore()

const searchQuery = ref('')
const selectedRarity = ref('all')
const sortOrder = ref('date-desc')

const currentPage = ref(1)
const itemsPerPage = 30

const allFilteredMovies = computed(() => {
  let movies = [...collection.ownedMovies]

  if (searchQuery.value) {
    movies = movies.filter((m) => m.title?.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }

  if (selectedRarity.value !== 'all') {
    movies = movies.filter((m) => {
      const note = Number(m.vote_average ?? 0)
      if (selectedRarity.value === 'legendaire') return note <= 2
      if (selectedRarity.value === 'rare') return note > 2 && note <= 4
      if (selectedRarity.value === 'commun') return note > 4
      return true
    })
  }

  switch (sortOrder.value) {
    case 'note-asc':
      movies.sort((a, b) => Number(a.vote_average ?? 0) - Number(b.vote_average ?? 0))
      break
    case 'note-desc':
      movies.sort((a, b) => Number(b.vote_average ?? 0) - Number(a.vote_average ?? 0))
      break
    case 'date-desc':
      movies.reverse()
      break
    case 'date-asc':
      break
  }

  return movies
})

const totalPages = computed(() => Math.ceil(allFilteredMovies.value.length / itemsPerPage))

const paginatedMovies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return allFilteredMovies.value.slice(start, end)
})
watch([searchQuery, selectedRarity, sortOrder], () => {
  currentPage.value = 1
})

const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const getScoreColor = (note: number) => {
  if (note <= 2) return 'text-yellow-500'
  if (note <= 4) return 'text-purple-400'
  return 'text-red-500'
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-black p-6 md:p-10">
    <div class="max-w-7xl mx-auto mb-10 border-b border-white/10 pb-6">
      <div class="flex flex-col md:flex-row justify-between items-end mb-6">
        <h2 class="text-4xl font-black text-white uppercase italic tracking-tighter">
          Ma Collection <span class="text-red-600 ml-2">({{ collection.ownedMovies.length }})</span>
        </h2>

        <span
          v-if="allFilteredMovies.length > 0"
          class="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 md:mt-0"
        >
          Page {{ currentPage }} / {{ totalPages }}
        </span>
      </div>

      <div class="flex flex-col md:flex-row gap-4 items-center">
        <div class="relative w-full md:w-96">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un film"
            class="w-full bg-slate-900 border border-slate-800 rounded-full px-6 py-3 text-white focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>

        <select
          v-model="selectedRarity"
          class="bg-slate-900 border border-slate-800 rounded-full px-6 py-3 text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer appearance-none"
        >
          <option value="all">Toutes les raretés</option>
          <option value="legendaire">Légendaire (Note ≤ 2)</option>
          <option value="rare">Rare (Note 2-4)</option>
          <option value="commun">Commun (Note > 4)</option>
        </select>

        <select
          v-model="sortOrder"
          class="w-full md:w-1/3 bg-slate-900 border border-slate-800 rounded-full px-6 py-3 text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer appearance-none"
        >
          <option value="date-desc">Date : Récents d'abord</option>
          <option value="date-asc">Date : Anciens d'abord</option>
          <option value="note-asc">Note : Croissante (0 → 10)</option>
          <option value="note-desc">Note : Décroissante (10 → 0)</option>
        </select>
      </div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div
        v-if="paginatedMovies.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      >
        <RouterLink
          v-for="movie in paginatedMovies"
          :key="movie.id"
          :to="{ name: 'movie-detail', params: { id: movie.id } }"
          class="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-red-600 transition-all duration-300 shadow-lg hover:-translate-y-2 block"
        >
          <div class="aspect-[2/3] overflow-hidden">
            <img
              loading="lazy"
              :src="
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : '/src/assets/random.png'
              "
              :alt="movie.title ?? ''"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          <div class="p-3 bg-slate-900/90 border-t border-white/5">
            <h3 class="text-sm font-bold text-white truncate mb-1" :title="movie.title">
              {{ movie.title }}
            </h3>
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest"
                >Note</span
              >
              <span :class="['font-black text-xs', getScoreColor(Number(movie.vote_average ?? 0))]">
                {{ Number(movie.vote_average ?? 0) }}
              </span>
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <div class="text-6xl mb-4 opacity-50">🎬</div>
        <h3 class="text-xl font-bold text-white uppercase italic">
          {{
            collection.ownedMovies.length > 0
              ? 'Aucun résultat pour cette recherche'
              : 'Ta collection est vide gros loser'
          }}
        </h3>
        <RouterLink
          v-if="collection.ownedMovies.length === 0"
          to="/booster"
          class="mt-6 px-8 py-3 bg-red-600 text-white font-black uppercase rounded-full hover:bg-red-700 transition-colors"
        >
          Ouvrir un booster
        </RouterLink>
      </div>

      <div v-if="totalPages > 1" class="mt-12 flex justify-center items-center gap-6">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-6 py-3 rounded-full bg-slate-800 text-white font-bold uppercase hover:bg-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800"
        >
          ← Précédent
        </button>

        <span class="text-white font-black text-lg">
          <span class="text-red-500">{{ currentPage }}</span>
          <span class="text-slate-600 mx-1">/</span> {{ totalPages }}
        </span>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-6 py-3 rounded-full bg-slate-800 text-white font-bold uppercase hover:bg-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800"
        >
          Suivant →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group:after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent);
  transform: skewX(-25deg);
  transition: 0.5s;
}
.group:hover:after {
  left: 150%;
}
</style>
