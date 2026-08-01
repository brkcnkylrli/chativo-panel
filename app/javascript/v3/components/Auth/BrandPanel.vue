<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

/*
 * Verilen tasarimdaki sol panel. Yorunge gorseli, olculeri ve hareketi
 * `auth-screens.css` icinde tasarim dosyasindaki degerlerle birebir duruyor;
 * burada yalnizca yapisi var.
 *
 * Alt yarisi slot: giris ekraninda tek bir cumle, kayit ekraninda fayda
 * kartlari ve rakamlar geliyor.
 */
defineProps({
  compact: { type: Boolean, default: false },
});

const store = useStore();
const globalConfig = computed(() => store.getters['globalConfig/get']);
</script>

<template>
  <div class="cha-brand">
    <div class="cha-brand-wash" />

    <img
      :src="globalConfig.logo"
      :alt="globalConfig.installationName"
      class="cha-brand-logo"
    />

    <div class="cha-stage">
      <div class="cha-orbit" :class="{ 'cha-orbit--compact': compact }">
        <svg viewBox="0 0 420 420" aria-hidden="true">
          <circle class="cha-ring" cx="210" cy="210" r="196" />
          <circle class="cha-ring" cx="210" cy="210" r="148" />
          <circle class="cha-ring" cx="210" cy="210" r="100" />
          <g>
            <circle class="cha-ring-dashed" cx="210" cy="210" r="174" />
            <circle class="cha-ring-dashed" cx="210" cy="210" r="124" />
          </g>
        </svg>

        <div class="cha-orbit-track">
          <span class="cha-dot cha-dot--live" />
          <span class="cha-dot cha-dot--accent" />
        </div>
        <div class="cha-orbit-track cha-orbit-track--reverse">
          <span class="cha-dot cha-dot--faint" />
        </div>

        <div class="cha-glow" />

        <img
          v-if="globalConfig.logoThumbnail"
          :src="globalConfig.logoThumbnail"
          alt=""
          class="cha-mark"
        />
      </div>
    </div>

    <slot />
  </div>
</template>
