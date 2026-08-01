<script setup>
import { ref, computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, email, sameAs } from '@vuelidate/validators';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAlert } from 'dashboard/composables';
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import { isValidPassword } from 'shared/helpers/Validators';
import GoogleOAuthButton from '../../../../../components/GoogleOauth/Button.vue';
import { register } from '../../../../../api/auth';
import * as CompanyEmailValidator from 'company-email-validator';

const MIN_PASSWORD_LENGTH = 6;

const store = useStore();
const { t } = useI18n();
const router = useRouter();

const hCaptcha = ref(null);
const isSignupInProgress = ref(false);

/*
 * Tasarimdaki alanlarin tamami burada. Ad, soyad ve isletme adi artik
 * kullaniciya soruluyor ve API'ye gonderiliyor: `api/v1/accounts` bu iki
 * alani (`user_full_name`, `account_name`) zaten kabul ediyordu, frontend
 * onlari e-postadan turetiyordu.
 */
const credentials = reactive({
  firstName: '',
  lastName: '',
  accountName: '',
  email: '',
  password: '',
  confirmPassword: '',
  hCaptchaClientResponse: '',
});

const rules = {
  credentials: {
    firstName: { required, minLength: minLength(2) },
    lastName: { required, minLength: minLength(2) },
    accountName: { required, minLength: minLength(2) },
    email: {
      required,
      email,
      businessEmailValidator(value) {
        return CompanyEmailValidator.isCompanyEmail(value);
      },
    },
    password: {
      required,
      isValidPassword,
      minLength: minLength(MIN_PASSWORD_LENGTH),
    },
    confirmPassword: {
      required,
      isSame: sameAs(computed(() => credentials.password)),
    },
  },
};

const v$ = useVuelidate(rules, { credentials });

const globalConfig = computed(() => store.getters['globalConfig/get']);

const termsLink = computed(() =>
  t('REGISTER.TERMS_ACCEPT')
    .replace('https://www.chatwoot.com/terms', globalConfig.value.termsURL)
    .replace(
      'https://www.chatwoot.com/privacy-policy',
      globalConfig.value.privacyURL
    )
);

const allowedLoginMethods = computed(
  () => window.chatwootConfig.allowedLoginMethods || ['email']
);

const showGoogleOAuth = computed(
  () =>
    allowedLoginMethods.value.includes('google_oauth') &&
    Boolean(window.chatwootConfig.googleOAuthClientId)
);

/*
 * Sifre gucu: tasarimdaki uc bolmeli cubuk. Uzunluk, harf karisimi ve
 * rakam/isaret varligina bakiyor - kuralin kendisi `isValidPassword` icinde,
 * buradaki yalnizca onun gorsel karsiligi.
 */
const passwordStrength = computed(() => {
  const value = credentials.password;
  if (!value) return 0;
  let score = 0;
  if (value.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
});

const strengthLabel = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return t('REGISTER.STRENGTH.WEAK');
    case 2:
      return t('REGISTER.STRENGTH.FAIR');
    case 3:
      return t('REGISTER.STRENGTH.STRONG');
    default:
      return '';
  }
});

const isFormValid = computed(() => !v$.value.$invalid);

const performRegistration = async () => {
  isSignupInProgress.value = true;
  try {
    await register({
      email: credentials.email,
      password: credentials.password,
      fullName: `${credentials.firstName} ${credentials.lastName}`.trim(),
      accountName: credentials.accountName.trim(),
      hCaptchaClientResponse: credentials.hCaptchaClientResponse,
    });
    router.push({
      name: 'auth_verify_email',
      state: { email: credentials.email },
    });
  } catch (error) {
    const errorMessage = error?.message || t('REGISTER.API.ERROR_MESSAGE');
    if (globalConfig.value.hCaptchaSiteKey) {
      hCaptcha.value.reset();
      credentials.hCaptchaClientResponse = '';
    }
    useAlert(errorMessage);
  } finally {
    isSignupInProgress.value = false;
  }
};

const submit = () => {
  if (isSignupInProgress.value) return;
  v$.value.$touch();
  if (v$.value.$invalid) return;
  isSignupInProgress.value = true;
  if (globalConfig.value.hCaptchaSiteKey) {
    hCaptcha.value.execute();
  } else {
    performRegistration();
  }
};

const onRecaptchaVerified = token => {
  credentials.hCaptchaClientResponse = token;
  performRegistration();
};

const onCaptchaError = () => {
  isSignupInProgress.value = false;
  credentials.hCaptchaClientResponse = '';
  hCaptcha.value.reset();
};
</script>

<template>
  <div>
    <GoogleOAuthButton v-if="showGoogleOAuth">
      {{ $t('REGISTER.OAUTH.GOOGLE_SIGNUP') }}
    </GoogleOAuthButton>

    <div v-if="showGoogleOAuth" class="cha-divider">
      {{ $t('REGISTER.DIVIDER') }}
    </div>

    <form @submit.prevent="submit">
      <div class="cha-row">
        <div class="field">
          <label for="first_name">{{ $t('REGISTER.FIRST_NAME.LABEL') }}</label>
          <input
            id="first_name"
            v-model="credentials.firstName"
            class="input"
            name="first_name"
            type="text"
            @blur="v$.credentials.firstName.$touch"
          />
        </div>
        <div class="field">
          <label for="last_name">{{ $t('REGISTER.LAST_NAME.LABEL') }}</label>
          <input
            id="last_name"
            v-model="credentials.lastName"
            class="input"
            name="last_name"
            type="text"
            @blur="v$.credentials.lastName.$touch"
          />
        </div>
      </div>

      <div class="field">
        <label for="account_name">
          {{ $t('REGISTER.COMPANY_NAME.LABEL') }}
        </label>
        <input
          id="account_name"
          v-model="credentials.accountName"
          class="input"
          name="account_name"
          type="text"
          @blur="v$.credentials.accountName.$touch"
        />
      </div>

      <div class="field">
        <label for="email_address">{{ $t('REGISTER.EMAIL.LABEL') }}</label>
        <input
          id="email_address"
          v-model="credentials.email"
          class="input"
          name="email_address"
          type="email"
          :placeholder="$t('REGISTER.EMAIL.PLACEHOLDER')"
          @blur="v$.credentials.email.$touch"
        />
        <p v-if="v$.credentials.email.$error" class="cha-error">
          {{ $t('REGISTER.EMAIL.ERROR') }}
        </p>
      </div>

      <div class="field">
        <label for="password">{{ $t('REGISTER.PASSWORD.LABEL') }}</label>
        <input
          id="password"
          v-model="credentials.password"
          class="input"
          name="password"
          type="password"
          @blur="v$.credentials.password.$touch"
        />
        <div v-if="credentials.password" class="cha-strength">
          <span :class="{ on: passwordStrength >= 1 }" />
          <span :class="{ on: passwordStrength >= 2 }" />
          <span :class="{ on: passwordStrength >= 3 }" />
          <em>{{ strengthLabel }}</em>
        </div>
        <p v-if="v$.credentials.password.$error" class="cha-error">
          {{ $t('REGISTER.PASSWORD.IS_INVALID_PASSWORD') }}
        </p>
      </div>

      <div class="field">
        <label for="confirm_password">
          {{ $t('REGISTER.CONFIRM_PASSWORD.LABEL') }}
        </label>
        <input
          id="confirm_password"
          v-model="credentials.confirmPassword"
          class="input"
          name="confirm_password"
          type="password"
          @blur="v$.credentials.confirmPassword.$touch"
        />
        <p v-if="v$.credentials.confirmPassword.$error" class="cha-error">
          {{ $t('REGISTER.CONFIRM_PASSWORD.ERROR') }}
        </p>
      </div>

      <VueHcaptcha
        v-if="globalConfig.hCaptchaSiteKey"
        ref="hCaptcha"
        size="invisible"
        :sitekey="globalConfig.hCaptchaSiteKey"
        @verify="onRecaptchaVerified"
        @error="onCaptchaError"
        @expired="onCaptchaError"
        @challenge-expired="onCaptchaError"
        @closed="onCaptchaError"
      />

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="cha-terms" v-html="termsLink" />

      <button
        type="submit"
        class="btn btn-primary btn-block"
        data-testid="submit_button"
        :disabled="isSignupInProgress || !isFormValid"
      >
        {{ $t('REGISTER.SUBMIT') }}
      </button>
    </form>
  </div>
</template>
