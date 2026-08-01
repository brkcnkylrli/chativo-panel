<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import SignupForm from './components/Signup/Form.vue';
import AuthBrandPanel from '../../../components/Auth/BrandPanel.vue';
import '../../../assets/nocturne.css';
import '../../../assets/auth-screens.css';

const store = useStore();
const { t } = useI18n();

const globalConfig = computed(() => store.getters['globalConfig/get']);

// Fayda kartlari ve rakamlar ceviri dosyasindan geliyor; anahtarlar dongude
// uretilmiyor - i18n aracligi statik anahtar bekliyor.
const benefits = computed(() => [
  {
    key: 'NO_CARD',
    title: t('REGISTER.BRAND.BENEFITS.NO_CARD.TITLE'),
    body: t('REGISTER.BRAND.BENEFITS.NO_CARD.BODY'),
  },
  {
    key: 'SETUP',
    title: t('REGISTER.BRAND.BENEFITS.SETUP.TITLE'),
    body: t('REGISTER.BRAND.BENEFITS.SETUP.BODY'),
  },
  {
    key: 'DATA',
    title: t('REGISTER.BRAND.BENEFITS.DATA.TITLE'),
    body: t('REGISTER.BRAND.BENEFITS.DATA.BODY'),
  },
]);

const stats = computed(() => [
  {
    key: 'BUSINESSES',
    value: t('REGISTER.BRAND.STATS.BUSINESSES.VALUE'),
    label: t('REGISTER.BRAND.STATS.BUSINESSES.LABEL'),
  },
  {
    key: 'CONVERSATIONS',
    value: t('REGISTER.BRAND.STATS.CONVERSATIONS.VALUE'),
    label: t('REGISTER.BRAND.STATS.CONVERSATIONS.LABEL'),
  },
  {
    key: 'RATING',
    value: t('REGISTER.BRAND.STATS.RATING.VALUE'),
    label: t('REGISTER.BRAND.STATS.RATING.LABEL'),
  },
]);
</script>

<template>
  <main class="chativo-auth cha-screen">
    <AuthBrandPanel compact>
      <div class="cha-brand-foot">
        <div class="cha-brand-title">{{ $t('REGISTER.BRAND.HEADLINE') }}</div>
      </div>

      <ul class="cha-benefits">
        <li v-for="benefit in benefits" :key="benefit.key" class="cha-benefit">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <div>
            <div class="cha-benefit-title">{{ benefit.title }}</div>
            <div class="cha-benefit-text">{{ benefit.body }}</div>
          </div>
        </li>
      </ul>

      <div class="cha-stats">
        <div v-for="stat in stats" :key="stat.key">
          <div class="cha-stat-value">{{ stat.value }}</div>
          <div class="cha-stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </AuthBrandPanel>

    <div class="cha-form-col">
      <img
        :src="globalConfig.logo"
        :alt="globalConfig.installationName"
        class="cha-mobile-logo"
      />

      <h1 class="cha-title">{{ $t('REGISTER.GET_STARTED') }}</h1>
      <p class="cha-sub">{{ $t('REGISTER.SUBTITLE') }}</p>

      <SignupForm />

      <div class="cha-meta">
        {{ $t('REGISTER.HAVE_AN_ACCOUNT') }}
        <router-link to="/app/login">{{ $t('LOGIN.SUBMIT') }}</router-link>
      </div>
    </div>
  </main>
</template>
