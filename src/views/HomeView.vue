<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden bg-black px-4">

    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black"></div>

    <div class="relative z-10 text-center mb-12">
      <h1 class="text-5xl md:text-9xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
        Patoplefilm
      </h1>
      <p class="text-slate-300 text-m md:text-xl font-medium mt-4">
        Collectionnez les pires films de tous les temps
      </p>
    </div>

    <div class="relative z-10 flex items-center justify-center w-full h-80 md:h-[450px]">

      <div class="absolute w-44 md:w-64 transform -rotate-12 -translate-x-28 md:-translate-x-44 translate-y-6 opacity-40 hover:opacity-100 transition-all duration-500 group">
        <img
          src="../assets/noel.webp"
          alt="noel"
          class="rounded-xl shadow-2xl border border-white/10 grayscale-[0.3] group-hover:grayscale-0"
        />
      </div>

      <div class="absolute w-44 md:w-64 transform rotate-12 translate-x-28 md:translate-x-44 translate-y-6 opacity-40 hover:opacity-100 transition-all duration-500 group">
        <img
          src="../assets/jsp.webp"
          alt="Le titre est trop long"
          class="rounded-xl shadow-2xl border border-white/10 grayscale-[0.3] group-hover:grayscale-0"
        />
      </div>

      <div class="absolute w-52 md:w-72 z-20 transform hover:scale-105 transition-transform duration-500">
        <div class="relative p-[2px] bg-gradient-to-b from-red-500 to-transparent rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.4)]">
          <img
            src="../assets/beauty.webp"
            alt="The Beauty"
            class="rounded-xl w-full h-full object-cover"
          />
        </div>
      </div>
    </div>

    <div class="absolute w-[1000px] h-[750px] bg-red-600/20 rounded-full blur-[120px] z-0 bottom-0"></div>
    <div class="relative z-10 mt-16 md:mt-24">
      <RouterLink
        to="/booster"
        class="group relative inline-flex items-center justify-center px-10 py-4 font-black text-white transition-all duration-300 bg-red-600 rounded-full hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] focus:outline-none uppercase tracking-widest"
      >
        Ouvrir un booster
      </RouterLink>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap');

h1 {
  font-family: 'Archivo Black', sans-serif;
}
</style>
