<script setup lang="ts">
import type { CarouselImage } from './types/carousel'

type PicsumImage = {
  id: string
  author: string
}

const selectedUrls = ref<string[]>([])

const { data, pending, error, refresh } = await useFetch<PicsumImage[]>(
  'https://picsum.photos/v2/list?page=3&limit=18',
  {
    server: false,
    default: () => []
  }
)

const carouselImages = computed<CarouselImage[]>(() =>
  (data.value ?? []).map((image) => ({
    id: image.id,
    src: `https://picsum.photos/id/${image.id}/900/600`,
    alt: `Photo by ${image.author}`,
    author: image.author
  }))
)
</script>

<template>
  <div class="page-shell">
    <NuxtRouteAnnouncer />

    <main class="page-layout">
      <section class="hero-panel">
        <p class="eyebrow">Nuxt Test Task</p>
        <h1>Responsive image carousel with infinite motion and selectable shots.</h1>
        <p class="hero-copy">
          Photos are loaded from Picsum, the carousel moves one image at a time, and
          every selected image URL appears below the gallery with a subtle entrance
          animation.
        </p>
      </section>

      <section class="surface-card">
        <div class="section-topline">
          <div>
            <p class="section-label">Gallery</p>
            <h2>Editorial-style carousel</h2>
          </div>
          <button
            type="button"
            class="ghost-button"
            @click="refresh()"
          >
            Refresh images
          </button>
        </div>

        <div
          v-if="pending"
          class="state-panel"
        >
          <span class="spinner" />
          <p>Loading the image set from Picsum...</p>
        </div>

        <div
          v-else-if="error"
          class="state-panel error-state"
        >
          <p>Couldn't load the image feed right now.</p>
          <button
            type="button"
            class="primary-button"
            @click="refresh()"
          >
            Try again
          </button>
        </div>

        <template v-else>
          <ImageCarousel
            :images="carouselImages"
            @selection-change="selectedUrls = $event"
          />

          <section class="selection-panel">
            <div class="selection-header">
              <div>
                <p class="section-label">Selected images</p>
                <h3>Chosen URLs</h3>
              </div>
              <span class="selection-count">
                {{ selectedUrls.length }}
              </span>
            </div>

            <TransitionGroup
              v-if="selectedUrls.length"
              name="selected-url"
              tag="ul"
              class="selected-list"
            >
              <li
                v-for="url in selectedUrls"
                :key="url"
                class="selected-item"
              >
                <a
                  :href="url"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ url }}
                </a>
              </li>
            </TransitionGroup>

            <p
              v-else
              class="empty-selection"
            >
              Select a few images from the carousel to build this list.
            </p>
          </section>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background:
    radial-gradient(circle at top, rgba(255, 196, 126, 0.28), transparent 28%),
    linear-gradient(135deg, #0f172a 0%, #172554 42%, #312e81 100%);
  color: #eff6ff;
}

:global(*) {
  box-sizing: border-box;
}

:global(a) {
  color: inherit;
}

.page-shell {
  min-height: 100vh;
  padding: 40px 20px 64px;
}

.page-layout {
  width: min(1160px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 28px;
}

.hero-panel,
.surface-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.32);
}

.hero-panel {
  padding: 40px;
}

.hero-panel::after,
.surface-card::after {
  content: "";
  position: absolute;
  inset: auto -10% -35% auto;
  width: 240px;
  aspect-ratio: 1;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.3), transparent 68%);
  pointer-events: none;
}

.eyebrow,
.section-label {
  margin: 0 0 10px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #7dd3fc;
}

h1,
h2,
h3 {
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.03em;
}

h1 {
  width: min(760px, 100%);
  font-size: clamp(2.2rem, 6vw, 4.5rem);
  line-height: 0.95;
}

h2 {
  font-size: clamp(1.5rem, 3vw, 2.15rem);
}

h3 {
  font-size: 1.25rem;
}

.hero-copy {
  width: min(680px, 100%);
  margin: 18px 0 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(226, 232, 240, 0.88);
}

.surface-card {
  padding: 28px;
}

.section-topline,
.selection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.selection-header {
  margin-bottom: 18px;
}

.ghost-button,
.primary-button {
  border: 0;
  border-radius: 999px;
  font: inherit;
  cursor: pointer;
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease;
}

.ghost-button {
  padding: 12px 18px;
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.08);
}

.ghost-button:hover,
.ghost-button:focus-visible,
.primary-button:hover,
.primary-button:focus-visible {
  transform: translateY(-1px);
}

.primary-button {
  padding: 12px 20px;
  color: #0f172a;
  background: linear-gradient(135deg, #f8fafc, #7dd3fc);
  box-shadow: 0 18px 30px rgba(125, 211, 252, 0.18);
}

.state-panel {
  min-height: 380px;
  display: grid;
  place-items: center;
  gap: 16px;
  padding: 40px 24px;
  text-align: center;
  color: rgba(226, 232, 240, 0.88);
}

.error-state {
  border-radius: 24px;
  background: rgba(127, 29, 29, 0.2);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.18);
  border-top-color: #7dd3fc;
  border-radius: 999px;
  animation: spin 900ms linear infinite;
}

.selection-panel {
  margin-top: 28px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.5);
}

.selection-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 46px;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #fef3c7, #fca5a5);
}

.selected-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.selected-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.07);
  color: #cbd5e1;
  word-break: break-all;
}

.selected-item a {
  text-decoration: none;
}

.selected-item a:hover,
.selected-item a:focus-visible {
  color: #fef3c7;
}

.empty-selection {
  margin: 0;
  color: rgba(226, 232, 240, 0.64);
}

.selected-url-enter-active,
.selected-url-leave-active,
.selected-url-move {
  transition: all 260ms ease;
}

.selected-url-enter-from,
.selected-url-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .page-shell {
    padding: 20px 14px 40px;
  }

  .hero-panel,
  .surface-card {
    border-radius: 22px;
  }

  .hero-panel {
    padding: 28px 22px;
  }

  .surface-card {
    padding: 18px;
  }

  .section-topline,
  .selection-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .ghost-button,
  .primary-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
