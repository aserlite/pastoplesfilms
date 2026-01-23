<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-black text-white font-sans">
    <nav class="flex gap-8 p-6 text-sm uppercase tracking-widest font-bold">
      <RouterLink
        to="/"
        class="hover:border-b-2 transition-all"
        active-class="border-b-2 border-white"
        >Home
      </RouterLink
      >
      <RouterLink
        to="/collection"
        class="hover:border-b-2 transition-all"
        active-class="border-b-2 border-white"
        >Collection</RouterLink
      >
      <RouterLink
        to="/booster"
        class="hover:border-b-2 transition-all"
        active-class="border-b-2 border-white"
        >Booster</RouterLink
      >
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>
