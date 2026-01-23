<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router' // Si tu as besoin de rediriger
import { useCollectionStore } from '@/stores/collection'

const collection = useCollectionStore()
const router = useRouter()

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const giftCode = params.get('gift')
  if (giftCode) {
    const movie = collection.receiveGift(giftCode)

    if (movie) {
      alert(`🎁 CADEAU REÇU ! Tu as obtenu : ${movie.title}`)
      router.push('/collection')
    } else {
      alert('❌ Lien invalide ou corrompu.')
    }
    window.history.replaceState({}, '', window.location.pathname)
  }
})
</script>

<template>
  <div class="min-h-screen bg-black text-white font-sans">
    <nav class="flex gap-8 p-6 text-sm uppercase tracking-widest font-bold">
      <RouterLink
        to="/"
        class="hover:border-b-2 transition-all"
        active-class="border-b-2 border-white"
        >Home
      </RouterLink>
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
      <RouterLink
        to="/merge"
        class="hover:border-b-2 transition-all"
        active-class="border-b-2 border-white"
        >Merge</RouterLink
      >
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>
