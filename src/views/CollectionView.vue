<script setup lang="ts">
import { useCollectionStore } from '@/stores/collection'

const collection = useCollectionStore()

const getScoreColor = (note: number) => {
  if (note <= 2) return 'text-yellow-500'
  if (note <= 4) return 'text-purple-400'
  return 'text-red-500'
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-black p-6 md:p-10">
    <div class="max-w-7xl mx-auto mb-10 border-b border-white/10 pb-6">
      <h2 class="text-4xl font-black text-white uppercase italic tracking-tighter">
        Ma Collection <span class="text-red-600 ml-2">({{ collection.ownedMovies.length }})</span>
      </h2>
    </div>

    <div class="max-w-7xl mx-auto">
      <div v-if="collection.ownedMovies.length > 0"
           class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">

        <div v-for="movie in collection.ownedMovies"
             :key="movie.id"
             class="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-red-600 transition-all duration-300 shadow-lg hover:-translate-y-2">

          <div class="aspect-[2/3] overflow-hidden">
            <img
              :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/src/assets/random.png'"
              :alt="movie.title ?? ''"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          <div class="p-3 bg-slate-900/90 border-t border-white/5">
            <h3 class="text-sm font-bold text-white truncate mb-1" :title="movie.title">
              {{ movie.title }}
            </h3>
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Note</span>
              <span :class="['font-black text-xs', getScoreColor(Number(movie.vote_average ?? 0))]">
                {{ Number(movie.vote_average ?? 0) }}
              </span>
            </div>
          </div>
        </div>

      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <div class="text-6xl mb-4">🎬</div>
        <h3 class="text-xl font-bold text-white uppercase italic">Ta collection est vide gros loser</h3>
        <RouterLink
          to="/booster"
          class="px-8 py-3 bg-red-600 text-white font-black uppercase rounded-full hover:bg-red-700 transition-colors"
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
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent);
  transform: skewX(-25deg);
  transition: 0.5s;
}
.group:hover:after {
  left: 150%;
}
</style>
