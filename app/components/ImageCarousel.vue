<script setup lang="ts">
import { nextTick } from 'vue'
import type { CarouselImage } from '../types/carousel'

const props = defineProps<{
  images: CarouselImage[]
}>()

const emit = defineEmits<{
  (event: 'selection-change', urls: string[]): void
}>()

const MOBILE_BREAKPOINT = 768
const DESKTOP_MIN_CARD_WIDTH = 200
const MAX_DESKTOP_CARDS = 5
const GAP = 20

const frameRef = ref<HTMLElement | null>(null)
const isAnimating = ref(true)
const slidesPerView = ref(1)
const currentIndex = ref(0)
const selectedUrls = ref<string[]>([])
let resizeObserver: ResizeObserver | null = null

const safeSlidesPerView = computed(() =>
  Math.min(Math.max(slidesPerView.value, 1), Math.max(props.images.length, 1))
)

const cloneCount = computed(() => {
  if (props.images.length <= 1) {
    return 0
  }

  return Math.min(props.images.length, safeSlidesPerView.value + 1)
})

const renderedImages = computed(() => {
  if (!props.images.length) {
    return []
  }

  return [
    ...props.images.slice(-cloneCount.value),
    ...props.images,
    ...props.images.slice(0, cloneCount.value)
  ]
})

const normalizedIndex = computed(() => {
  if (!props.images.length) {
    return 0
  }

  return ((currentIndex.value % props.images.length) + props.images.length) % props.images.length
})

const visibleRangeLabel = computed(() => {
  const total = props.images.length

  if (!total) {
    return '0 / 0'
  }

  const start = normalizedIndex.value + 1
  const end = normalizedIndex.value + safeSlidesPerView.value

  if (end <= total) {
    return `${start}-${end} / ${total}`
  }

  return `${start}-${total}, 1-${end - total} / ${total}`
})

const frameStyles = computed(() => ({
  '--gap': `${GAP}px`,
  '--slides-per-view': String(safeSlidesPerView.value),
  '--translate-index': String(currentIndex.value + cloneCount.value),
  '--track-transition': isAnimating.value
    ? 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)'
    : 'none'
}))

const canScroll = computed(() => props.images.length > 1)

function updateSlidesPerView(width: number) {
  if (width < MOBILE_BREAKPOINT) {
    slidesPerView.value = 1
    return
  }

  const possibleSlides = Math.floor((width + GAP) / (DESKTOP_MIN_CARD_WIDTH + GAP))
  slidesPerView.value = Math.min(MAX_DESKTOP_CARDS, Math.max(1, possibleSlides))
}

function goToNext() {
  if (!canScroll.value) {
    return
  }

  isAnimating.value = true
  currentIndex.value += 1
}

function goToPrevious() {
  if (!canScroll.value) {
    return
  }

  isAnimating.value = true
  currentIndex.value -= 1
}

function toggleSelection(url: string) {
  if (selectedUrls.value.includes(url)) {
    selectedUrls.value = selectedUrls.value.filter((selectedUrl) => selectedUrl !== url)
    return
  }

  selectedUrls.value = [...selectedUrls.value, url]
}

async function jumpWithoutAnimation(index: number) {
  isAnimating.value = false
  currentIndex.value = index
  await nextTick()
  requestAnimationFrame(() => {
    isAnimating.value = true
  })
}

function handleTransitionEnd(event: TransitionEvent) {
  if (event.target !== event.currentTarget || !props.images.length) {
    return
  }

  if (currentIndex.value < 0) {
    void jumpWithoutAnimation(props.images.length - 1)
    return
  }

  if (currentIndex.value >= props.images.length) {
    void jumpWithoutAnimation(0)
  }
}

watch(
  selectedUrls,
  (urls) => {
    emit('selection-change', [...urls])
  },
  { immediate: true }
)

watch(
  () => props.images.length,
  (length) => {
    if (!length) {
      currentIndex.value = 0
      selectedUrls.value = []
      return
    }

    if (currentIndex.value >= length) {
      currentIndex.value = 0
    }

    selectedUrls.value = selectedUrls.value.filter((url) =>
      props.images.some((image) => image.src === url)
    )
  },
  { immediate: true }
)

onMounted(() => {
  if (!frameRef.value) {
    return
  }

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]

    if (!entry) {
      return
    }

    updateSlidesPerView(entry.contentRect.width)
  })

  resizeObserver.observe(frameRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <section class="carousel-shell">
    <div class="carousel-header">
      <div>
        <p class="supporting-label">Infinite scroll</p>
        <p class="supporting-copy">
          Use the arrows to move exactly one image at a time.
        </p>
      </div>

      <div class="carousel-toolbar">
        <p class="range-pill">
          {{ visibleRangeLabel }}
        </p>

        <div class="carousel-controls">
          <button
            type="button"
            class="nav-button"
            aria-label="Previous image"
            @click="goToPrevious"
          >
            <span aria-hidden="true">&larr;</span>
          </button>

          <button
            type="button"
            class="nav-button"
            aria-label="Next image"
            @click="goToNext"
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </div>

    <div
      ref="frameRef"
      class="carousel-frame"
      :style="frameStyles"
    >
      <CarouselCardMapper
        :images="renderedImages"
        :selected-urls="selectedUrls"
        @toggle-selection="toggleSelection"
        @track-transition-end="handleTransitionEnd"
      />
    </div>
  </section>
</template>

<style scoped>
.carousel-shell {
  display: grid;
  gap: 18px;
}

.carousel-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.supporting-label {
  margin: 0 0 6px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7dd3fc;
}

.supporting-copy {
  margin: 0;
  color: rgba(226, 232, 240, 0.72);
}

.carousel-toolbar,
.carousel-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-pill {
  margin: 0;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
}

.nav-button {
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #eff6ff;
  font: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease;
}

.nav-button:hover,
.nav-button:focus-visible {
  transform: translateY(-1px);
  background: rgba(125, 211, 252, 0.18);
  border-color: rgba(125, 211, 252, 0.32);
}

.carousel-frame {
  --slide-size: calc((100% - (var(--gap) * (var(--slides-per-view) - 1))) / var(--slides-per-view));
  overflow: hidden;
}

@media (max-width: 767px) {
  .carousel-header,
  .carousel-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .carousel-controls {
    justify-content: space-between;
  }

  .nav-button {
    width: calc(50% - 5px);
    border-radius: 18px;
  }
}
</style>
