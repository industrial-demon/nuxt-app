<script setup lang="ts">
import type { CarouselImage } from '../types/carousel'

defineProps<{
  image: CarouselImage
  selected: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle', url: string): void
}>()
</script>

<template>
  <button
    type="button"
    class="image-card"
    :class="{ 'is-selected': selected }"
    :aria-pressed="selected"
    @click="emit('toggle', image.src)"
  >
    <img
      :src="image.src"
      :alt="image.alt"
      loading="lazy"
    >

    <span class="image-overlay" />

    <span class="image-meta">
      <span class="image-chip">
        {{ selected ? 'Selected' : 'Tap to select' }}
      </span>
      <span class="image-author">{{ image.author }}</span>
    </span>
  </button>
</template>

<style scoped>
.image-card {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 24px;
  background: #0f172a;
  text-align: left;
  cursor: pointer;
  isolation: isolate;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.28);
  transform: translateY(0);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease;
}

.image-card:hover,
.image-card:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.4);
}

.image-card img,
.image-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.image-card img {
  object-fit: cover;
}

.image-overlay {
  background:
    linear-gradient(180deg, transparent 5%, rgba(15, 23, 42, 0.12) 40%, rgba(15, 23, 42, 0.88) 100%);
}

.image-meta {
  position: absolute;
  inset: auto 16px 16px;
  display: grid;
  gap: 8px;
  z-index: 1;
}

.image-chip {
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.88);
}

.image-author {
  font-size: 1.02rem;
  font-weight: 600;
  color: #f8fafc;
}

.is-selected {
  outline: 3px solid rgba(125, 211, 252, 0.92);
  outline-offset: -3px;
}

.is-selected .image-chip {
  background: linear-gradient(135deg, #7dd3fc, #fef3c7);
}

@media (max-width: 767px) {
  .image-card {
    aspect-ratio: 16 / 11;
    border-radius: 20px;
  }
}
</style>
