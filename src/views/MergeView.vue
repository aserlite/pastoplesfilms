<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCollectionStore, type Movie } from '@/stores/collection'
import { MovieApiService } from '@/services/tmdb.service'

const collection = useCollectionStore()
const isMerging = ref(false)
const mergedMovie = ref<Movie | null>(null)

const stats = computed(() => collection.collectionStats)

const handleMerge = async (fromRarity: 'commun' | 'rare') => {
  if (isMerging.value) return

  const success = collection.mergeCards(fromRarity)

  if (success) {
    isMerging.value = true
    mergedMovie.value = null

    try {
      const targetMaxVote = fromRarity === 'commun' ? 4 : 2
      const movie = await MovieApiService.fetchRandomMovie(targetMaxVote)

      if (movie) {
        mergedMovie.value = movie as Movie
        collection.addMovie(mergedMovie.value)
      }
    } catch (error) {
      console.error('Erreur fusion', error)
    } finally {
      isMerging.value = false
    }
  }
}

const getRarityUI = (note: number) => {
  if (note <= 2) return { label: 'Légendaire', color: 'text-yellow-500' }
  if (note <= 4) return { label: 'Rare', color: 'text-purple-500' }
  return { label: 'Commun', color: 'text-red-500' }
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-black p-6 md:p-10 flex flex-col items-center">
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
            class="w-50 h-50 mx-auto"
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
          @click="handleMerge('commun')"
          :disabled="stats.commun.length < 15 || isMerging"
          class="w-full py-4 border-4 border-purple-500 rounded-full font-black uppercase text-purple-500 transition-all hover:bg-purple-500 hover:text-white active:scale-95 disabled:opacity-20 disabled:border-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
        >
          {{ isMerging ? 'Fusion...' : 'Fusionner' }}
        </button>
      </div>

      <div
        class="bg-slate-900/50 border-2 border-slate-800 p-8 rounded-3xl flex flex-col items-center gap-6"
      >
        <div class="text-center">
          <img
            src="../assets/phase_4_mr_incredible.webp"
            alt="mr incredible"
            class="w-50 h-50 mx-auto"
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
          @click="handleMerge('rare')"
          :disabled="stats.rare.length < 15 || isMerging"
          class="w-full py-4 border-4 border-yellow-500 rounded-full font-black uppercase text-yellow-500 transition-all hover:bg-yellow-500 hover:text-black active:scale-95 disabled:opacity-20 disabled:border-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
        >
          {{ isMerging ? 'Fusion...' : 'Fusionner' }}
        </button>
      </div>
    </div>

    <div v-if="mergedMovie || isMerging" class="mt-8 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">

      <div class="text-white font-black uppercase tracking-widest mb-6 text-xl">Résultat de la fusion</div>

      <div
        class="relative w-64 h-96 md:w-72 md:h-[420px] bg-slate-900 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500"
        :class="{ 'animate-pulse scale-95 border-purple-500/50': isMerging, 'hover:scale-105 hover:border-white/20': !isMerging }"
      >
        <img
          :src="mergedMovie?.poster_path ? `https://image.tmdb.org/t/p/w500${mergedMovie.poster_path}` : '/src/assets/random.png'"
          alt="Résultat fusion"
          draggable="false"
          class="w-full h-full object-cover transition-opacity duration-500"
          :class="isMerging ? 'opacity-20' : 'opacity-80'"
        />

        <div
          v-if="mergedMovie && !isMerging"
          class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent"
        >
          <div class="flex flex-col">
        <span
          :class="[
            'text-[10px] uppercase tracking-[0.2em] font-black',
            getRarityUI(mergedMovie?.vote_average ?? 0).color,
          ]"
        >
          Rareté : {{ getRarityUI(mergedMovie?.vote_average ?? 0).label }}
        </span>
            <h3 class="text-lg font-bold text-white leading-tight truncate">
              {{ mergedMovie?.title }}
            </h3>
          </div>
        </div>

        <div v-if="isMerging" class="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <span class="text-white font-black italic animate-bounce tracking-widest text-lg">FUSION...</span>
          <span class="text-[10px] text-slate-400 uppercase mt-2">Assemblage moléculaire</span>
        </div>
      </div>
    </div>
  </div>
</template>
