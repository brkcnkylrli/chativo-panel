<script setup>
/**
 * Chativo eki: acilis ekranindaki tiklanabilir sorular.
 *
 * Sorularin metni urune gomulu degil, widget'i cagiran sayfadan geliyor;
 * kaynaklari `widget/helpers/hazirSorular.js` icinde anlatildi.
 *
 * Liste bos oldugunda bileseni hic cizmemek cagirana birakildi (Home'daki
 * `v-if`): hazir soru vermeyen sayfalarda acilis ekraninda bos bir bolme ve
 * onun bosluk payi kalmasin diye.
 */
defineProps({
  sorular: { type: Array, default: () => [] },
});

defineEmits(['sor']);
</script>

<template>
  <div>
    <div
      class="mb-2 text-[11px] font-medium tracking-wider uppercase text-n-slate-10"
    >
      {{ $t('HAZIR_SORULAR.BASLIK') }}
    </div>

    <ul class="flex flex-col gap-1.5">
      <li v-for="soru in sorular" :key="soru">
        <button
          class="flex items-center justify-between w-full gap-3 px-3.5 py-2.5 text-sm leading-snug text-left transition-colors border rounded-lg bg-n-background dark:bg-n-solid-2 border-n-container text-n-slate-12 hover:border-n-slate-6"
          type="button"
          @click="$emit('sor', soru)"
        >
          <span>{{ soru }}</span>
          <i class="flex-none i-lucide-chevron-right size-4 text-n-slate-10" />
        </button>
      </li>
    </ul>
  </div>
</template>
