<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCollectionStore } from '@/stores/collection'

const collection = useCollectionStore()

const searchQuery = ref('')
const selectedRarity = ref('all')

const filteredMovies = computed(() => {
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

  return movies.reverse()
})

const getScoreColor = (note: number) => {
  if (note <= 2) return 'text-yellow-500'
  if (note <= 4) return 'text-purple-400'
  return 'text-red-500'
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-black p-6 md:p-10">
    <div class="max-w-7xl mx-auto mb-10 border-b border-white/10 pb-6">
      <h2 class="text-4xl font-black text-white uppercase italic tracking-tighter mb-6">
        Ma Collection <span class="text-red-600 ml-2">({{ collection.ownedMovies.length }})</span>
      </h2>

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
          <option value="legendaire">Légendaire</option>
          <option value="rare">Rare</option>
          <option value="commun">Commun</option>
        </select>
      </div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div
        v-if="filteredMovies.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      >
        <RouterLink
          v-for="movie in filteredMovies"
          :key="movie.id"
          :to="{ name: 'movie-detail', params: { id: movie.id } }"
          class="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-red-600 transition-all duration-300 shadow-lg hover:-translate-y-2 block"
        >
          <div class="aspect-[2/3] overflow-hidden">
            <img
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
