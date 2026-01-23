<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MovieApiService } from '@/services/tmdb.service'

interface Video {
  id: string
  key: string
  site: string
  type: string
}

interface Genre {
  id: number
  name: string
}

interface MovieDetail {
  id: number
  title: string
  poster_path?: string
  release_date?: string
  vote_average: number
  runtime?: number
  overview?: string
  imdb_id?: string
  genres: Genre[]
  videos?: {
    results: Video[]
  }
}

const route = useRoute()
const router = useRouter()

const movie = ref<MovieDetail | null>(null)
const isLoading = ref(true)

const trailerKey = computed(() => {
  if (!movie.value?.videos?.results) return null

  const trailer = movie.value.videos.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer',
  )
  return trailer ? trailer.key : null
})

const formatRuntime = (minutes?: number) => {
  if (!minutes) return 'Inconnue'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h${m.toString().padStart(2, '0')}`
}

onMounted(async () => {
  const movieId = Number(route.params.id)
  try {
    movie.value = (await MovieApiService.fetchMovieDetails(movieId)) as MovieDetail
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-black text-white pb-20">
    <div
      class="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-4"
    >
      <button
        @click="router.back()"
        class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        ←
      </button>
      <h1 v-if="movie" class="font-bold truncate text-lg uppercase tracking-widest">
        {{ movie.title }}
      </h1>
    </div>

    <div v-if="isLoading" class="h-[80vh] flex items-center justify-center">
      <span class="animate-pulse font-black text-xl italic">CHARGEMENT...</span>
    </div>

    <div v-else-if="movie" class="max-w-4xl mx-auto p-4 md:p-8">
      <div class="flex flex-col md:flex-row gap-8 mb-12">
        <div class="w-full md:w-1/3 flex-shrink-0">
          <div
            class="rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500"
          >
            <img
              :src="
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : '/src/assets/random.png'
              "
              class="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div class="flex-1 flex flex-col justify-center">
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="bg-red-600 px-3 py-1 rounded text-xs font-black uppercase">{{
              movie.release_date?.split('-')[0]
            }}</span>
            <span class="bg-slate-800 px-3 py-1 rounded text-xs font-black uppercase">{{
              formatRuntime(movie.runtime)
            }}</span>
            <span class="bg-yellow-500 text-black px-3 py-1 rounded text-xs font-black uppercase"
              >Note : {{ movie.vote_average.toFixed(1) }}</span
            >
          </div>

          <h1
            class="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-6"
          >
            {{ movie.title }}
          </h1>

          <p class="text-slate-400 text-lg leading-relaxed font-medium">
            {{ movie.overview || "Aucun synopsis disponible pour ce chef-d'œuvre incompris." }}
          </p>

          <div class="mt-8 flex flex-wrap gap-2">
            <span
              v-for="genre in movie.genres"
              :key="genre.id"
              class="text-xs text-slate-500 border border-slate-800 px-3 py-1 rounded-full uppercase tracking-widest"
            >
              {{ genre.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="trailerKey" class="mb-12">
        <h3 class="text-2xl font-black uppercase italic mb-6 flex items-center gap-2">
          <span class="text-red-600">▶</span> Bande-annonce
        </h3>
        <div
          class="aspect-video w-full rounded-2xl overflow-hidden border-4 border-slate-800 bg-slate-900 shadow-2xl"
        >
          <iframe
            class="w-full h-full"
            :src="`https://www.youtube.com/embed/${trailerKey}`"
            title="YouTube video player"
            frameborder="0"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
            "
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <div class="text-center">
        <a
          :href="`https://www.themoviedb.org/movie/${movie.id}`"
          target="_blank"
          class="inline-block px-8 py-4 bg-red-600 rounded-full font-black uppercase text-white hover:bg-red-700 hover:scale-105 transition-all shadow-lg"
        >
          Voir la fiche TMdb
        </a>
      </div>
    </div>
  </div>
</template>
