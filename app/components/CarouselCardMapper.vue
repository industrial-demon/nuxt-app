<script setup lang="ts">
import type { CarouselImage } from '../types/carousel'

const props = defineProps<{
  images: CarouselImage[]
  selectedUrls: string[]
}>()

const emit = defineEmits<{
  (event: 'toggle-selection', url: string): void
  (event: 'track-transition-end', eventData: TransitionEvent): void
}>()

function isSelected(url: string) {
  return props.selectedUrls.includes(url)
}
</script>

<template>
  <div
    class="carousel-track"
    @transitionend="emit('track-transition-end', $event)"
  >
    <article
      v-for="(image, index) in images"
      :key="`${image.id}-${index}`"
      class="carousel-slide"
    >
      <CarouselCard
        :image="image"
        :selected="isSelected(image.src)"
        @toggle="emit('toggle-selection', $event)"
      />
    </article>
  </div>
</template>

<style scoped>
.carousel-track {
  display: flex;
  gap: var(--gap);
  transform: translate3d(calc((var(--slide-size) + var(--gap)) * var(--translate-index) * -1), 0, 0);
  transition: var(--track-transition);
  will-change: transform;
}

.carousel-slide {
  flex: 0 0 var(--slide-size);
  min-width: 0;
}
</style>
