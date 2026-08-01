<script>
// utils and composables
import { login } from '../../api/auth';
import '../../assets/nocturne.css';
import '../../assets/auth-screens.css';
import { mapGetters } from 'vuex';
import { useAlert } from 'dashboard/composables';
import { required, email } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';
import { SESSION_STORAGE_KEYS } from 'dashboard/constants/sessionStorage';
import SessionStorage from 'shared/helpers/sessionStorage';
import { useBranding } from 'shared/composables/useBranding';
import { CHATIVO_SIGNUP_URL } from '../../helpers/RouteHelper';
import AnalyticsHelper from 'dashboard/helper/AnalyticsHelper';
import { SESSION_EVENTS } from 'dashboard/helper/AnalyticsHelper/events';

// components
import AuthBrandPanel from '../../components/Auth/BrandPanel.vue';
import GoogleOAuthButton from '../../components/GoogleOauth/Button.vue';
import Spinner from 'shared/components/Spinner.vue';
import Icon from 'dashboard/components-next/icon/Icon.vue';
import MfaVerification from 'dashboard/components/auth/MfaVerification.vue';
import SessionLimitOverlay from 'dashboard/components/auth/SessionLimitOverlay.vue';

const ERROR_MESSAGES = {
  'no-account-found': 'LOGIN.OAUTH.NO_ACCOUNT_FOUND',
  'business-account-only': 'LOGIN.OAUTH.BUSINESS_ACCOUNTS_ONLY',
  'saml-authentication-failed': 'LOGIN.SAML.API.ERROR_MESSAGE',
  'saml-not-enabled': 'LOGIN.SAML.API.ERROR_MESSAGE',
};

const IMPERSONATION_URL_SEARCH_KEY = 'impersonation';
const USER_NOT_CONFIRMED_ERROR_CODE = 'user_not_confirmed';

export default {
  components: {
    AuthBrandPanel,
    GoogleOAuthButton,
    Spinner,
    MfaVerification,
    SessionLimitOverlay,
    Icon,
  },
  props: {
    ssoAuthToken: { type: String, default: '' },
    ssoAccountId: { type: String, default: '' },
    ssoConversationId: { type: String, default: '' },
    email: { type: String, default: '' },
    authError: { type: String, default: '' },
  },
  setup() {
    const { replaceInstallationName } = useBranding();
    return {
      replaceInstallationName,
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      // We need to initialize the component with any
      // properties that will be used in it
      credentials: {
        email: '',
        password: '',
      },
      loginApi: {
        message: '',
        showLoading: false,
        hasErrored: false,
      },
      error: '',
      mfaRequired: false,
      mfaToken: null,
      sessionsLimitReached: false,
      limitedSessions: [],
    };
  },
  validations() {
    return {
      credentials: {
        password: {
          required,
        },
        email: {
          required,
          email,
        },
      },
    };
  },
  computed: {
    ...mapGetters({ globalConfig: 'globalConfig/get' }),
    allowedLoginMethods() {
      return window.chatwootConfig.allowedLoginMethods || ['email'];
    },
    showGoogleOAuth() {
      return (
        this.allowedLoginMethods.includes('google_oauth') &&
        Boolean(window.chatwootConfig.googleOAuthClientId)
      );
    },
    // Kayit baglantisi her zaman gorunuyor. Panelde kayit kapali
    // (ENABLE_ACCOUNT_SIGNUP=false) ama musteri chativo.tr/kayit uzerinden
    // kaydolabiliyor; eski kosul bu yuzden yanlisti - giris ekraninda
    // kaydolacak hicbir yol gorunmuyordu.
    signupUrl() {
      return CHATIVO_SIGNUP_URL;
    },
    showSamlLogin() {
      return this.allowedLoginMethods.includes('saml');
    },
    // Ceviri metni varsayilan chatwoot.com adreslerini tasiyor; kurulumun
    // kendi sozlesme adresleri tanimliysa onlarla degistiriyoruz. Ayni
    // yaklasim kayit formunda da kullaniliyor.
    termsNote() {
      return this.$t('LOGIN.TERMS_NOTE')
        .replace('https://www.chatwoot.com/terms', this.globalConfig.termsURL)
        .replace(
          'https://www.chatwoot.com/privacy-policy',
          this.globalConfig.privacyURL
        );
    },
    // Yan panel yalnizca formun tamami ekrandayken anlamli: MFA ve oturum
    // limiti adimlarinda kullanici tek bir karara odaklanmali.
    showBrandPanel() {
      return !this.mfaRequired && !this.sessionsLimitReached;
    },
  },
  created() {
    if (this.ssoAuthToken) {
      this.submitLogin();
    }
    if (this.authError) {
      const messageKey = ERROR_MESSAGES[this.authError] ?? 'LOGIN.API.UNAUTH';
      // Use a method to get the translated text to avoid dynamic key warning
      const translatedMessage = this.getTranslatedMessage(messageKey);
      useAlert(translatedMessage);
      // wait for idle state
      this.requestIdleCallbackPolyfill(() => {
        // Remove the error query param from the url
        const { query } = this.$route;
        this.$router.replace({ query: { ...query, error: undefined } });
      });
    }
  },
  methods: {
    getTranslatedMessage(key) {
      // Avoid dynamic key warning by handling each case explicitly
      switch (key) {
        case 'LOGIN.OAUTH.NO_ACCOUNT_FOUND':
          return this.$t('LOGIN.OAUTH.NO_ACCOUNT_FOUND');
        case 'LOGIN.OAUTH.BUSINESS_ACCOUNTS_ONLY':
          return this.$t('LOGIN.OAUTH.BUSINESS_ACCOUNTS_ONLY');
        case 'LOGIN.API.UNAUTH':
        default:
          return this.$t('LOGIN.API.UNAUTH');
      }
    },
    // TODO: Remove this when Safari gets wider support
    // Ref: https://caniuse.com/requestidlecallback
    //
    requestIdleCallbackPolyfill(callback) {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(callback);
      } else {
        // Fallback for safari
        // Using a delay of 0 allows the callback to be executed asynchronously
        // in the next available event loop iteration, similar to requestIdleCallback
        setTimeout(callback, 0);
      }
    },
    showAlertMessage(message) {
      // Reset loading, current selected agent
      this.loginApi.showLoading = false;
      this.loginApi.message = message;
      useAlert(this.loginApi.message);
    },
    handleImpersonation() {
      // Detects impersonation mode via URL and sets a session flag to prevent user settings changes during impersonation.
      const urlParams = new URLSearchParams(window.location.search);
      const impersonation = urlParams.get(IMPERSONATION_URL_SEARCH_KEY);
      if (impersonation) {
        SessionStorage.set(SESSION_STORAGE_KEYS.IMPERSONATION_USER, true);
      }
    },
    submitLogin() {
      this.loginApi.hasErrored = false;
      this.loginApi.showLoading = true;

      const credentials = {
        email: this.email
          ? decodeURIComponent(this.email)
          : this.credentials.email,
        password: this.credentials.password,
        sso_auth_token: this.ssoAuthToken,
        ssoAccountId: this.ssoAccountId,
        ssoConversationId: this.ssoConversationId,
      };

      login(credentials)
        .then(result => {
          // Check if MFA is required
          if (result?.mfaRequired) {
            this.loginApi.showLoading = false;
            this.mfaRequired = true;
            this.mfaToken = result.mfaToken;
            return;
          }

          // Check if sessions limit reached
          if (result?.sessionsLimitReached) {
            this.loginApi.showLoading = false;
            this.sessionsLimitReached = true;
            this.limitedSessions = result.sessions;
            AnalyticsHelper.track(SESSION_EVENTS.LIMIT_HIT);
            return;
          }

          this.handleImpersonation();
          this.showAlertMessage(this.$t('LOGIN.API.SUCCESS_MESSAGE'));
        })
        .catch(response => {
          if (response?.errorCode === USER_NOT_CONFIRMED_ERROR_CODE) {
            this.loginApi.showLoading = false;
            this.$router.push({
              name: 'auth_verify_email',
              state: { email: credentials.email },
            });
            return;
          }

          // Reset URL Params if the authentication is invalid
          if (this.email) {
            window.location = '/app/login';
          }
          this.loginApi.hasErrored = true;
          this.showAlertMessage(
            response?.message || this.$t('LOGIN.API.UNAUTH')
          );
        });
    },
    submitFormLogin() {
      if (this.v$.credentials.email.$invalid && !this.email) {
        this.showAlertMessage(this.$t('LOGIN.EMAIL.ERROR'));
        return;
      }

      this.submitLogin();
    },
    handleMfaVerified() {
      // MFA verification successful, continue with login
      this.handleImpersonation();
      window.location = '/app';
    },
    handleMfaCancel() {
      // User cancelled MFA, reset state
      this.mfaRequired = false;
      this.mfaToken = null;
      this.credentials.password = '';
    },
    retryLoginWithParams(extraParams) {
      const credentials = {
        email: this.email
          ? decodeURIComponent(this.email)
          : this.credentials.email,
        password: this.credentials.password,
        sso_auth_token: this.ssoAuthToken,
        ssoAccountId: this.ssoAccountId,
        ssoConversationId: this.ssoConversationId,
        ...extraParams,
      };

      this.sessionsLimitReached = false;
      this.limitedSessions = [];
      this.loginApi.showLoading = true;
      login(credentials)
        .then(result => {
          if (result?.sessionsLimitReached) {
            this.loginApi.showLoading = false;
            this.sessionsLimitReached = true;
            this.limitedSessions = result.sessions;
            AnalyticsHelper.track(SESSION_EVENTS.LIMIT_HIT);
            return;
          }
          this.handleImpersonation();
          this.showAlertMessage(this.$t('LOGIN.API.SUCCESS_MESSAGE'));
        })
        .catch(response => {
          this.loginApi.hasErrored = true;
          this.showAlertMessage(
            response?.message || this.$t('LOGIN.API.UNAUTH')
          );
        });
    },
    handleSessionRevoke(sessionId) {
      this.retryLoginWithParams({ revoke_session_id: sessionId });
    },
    handleSessionRevokeAll() {
      this.retryLoginWithParams({ revoke_all_sessions: true });
    },
    handleSessionLimitCancel() {
      this.sessionsLimitReached = false;
      this.limitedSessions = [];
      this.credentials.password = '';
    },
  },
};
</script>

<template>
  <main class="chativo-auth cha-screen">
    <AuthBrandPanel v-if="showBrandPanel">
      <div class="cha-brand-foot">
        <div class="cha-brand-title">{{ $t('LOGIN.BRAND.HEADLINE') }}</div>
        <p class="cha-brand-text">
          {{ replaceInstallationName($t('LOGIN.BRAND.SUBLINE')) }}
        </p>
      </div>
    </AuthBrandPanel>

    <div class="cha-form-col">
      <!-- Oturum limiti -->
      <section v-if="sessionsLimitReached">
        <SessionLimitOverlay
          :sessions="limitedSessions"
          @revoke="handleSessionRevoke"
          @revoke-all="handleSessionRevokeAll"
          @cancel="handleSessionLimitCancel"
        />
      </section>

      <!-- Iki adimli dogrulama -->
      <section v-else-if="mfaRequired">
        <MfaVerification
          :mfa-token="mfaToken"
          @verified="handleMfaVerified"
          @cancel="handleMfaCancel"
        />
      </section>

      <!-- Giris -->
      <template v-else>
        <div v-if="!email" :class="{ 'animate-wiggle': loginApi.hasErrored }">
          <h1 class="cha-title">
            {{ replaceInstallationName($t('LOGIN.TITLE')) }}
          </h1>
          <p class="cha-sub">{{ $t('LOGIN.SUBTITLE') }}</p>

          <GoogleOAuthButton v-if="showGoogleOAuth" class="cha-oauth" />

          <router-link
            v-if="showSamlLogin"
            to="/app/login/sso"
            class="btn btn-secondary btn-block"
          >
            <Icon icon="i-lucide-lock-keyhole" class="size-4" />
            {{ $t('LOGIN.SAML.LABEL') }}
          </router-link>

          <div v-if="showGoogleOAuth || showSamlLogin" class="cha-divider">
            {{ $t('LOGIN.DIVIDER') }}
          </div>

          <form @submit.prevent="submitFormLogin">
            <div class="field">
              <label for="email_address">{{ $t('LOGIN.EMAIL.LABEL') }}</label>
              <input
                id="email_address"
                v-model="credentials.email"
                class="input"
                name="email_address"
                type="text"
                data-testid="email_input"
                :tabindex="1"
                required
                :placeholder="$t('LOGIN.EMAIL.PLACEHOLDER')"
                @input="v$.credentials.email.$touch"
              />
            </div>

            <div class="field">
              <div class="cha-label-row">
                <label for="password">{{ $t('LOGIN.PASSWORD.LABEL') }}</label>
                <router-link
                  v-if="!globalConfig.disableUserProfileUpdate"
                  to="auth/reset/password"
                  :tabindex="4"
                >
                  {{ $t('LOGIN.FORGOT_PASSWORD') }}
                </router-link>
              </div>
              <input
                id="password"
                v-model="credentials.password"
                class="input"
                type="password"
                name="password"
                data-testid="password_input"
                required
                :tabindex="2"
                :placeholder="$t('LOGIN.PASSWORD.PLACEHOLDER')"
                @input="v$.credentials.password.$touch"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              data-testid="submit_button"
              :tabindex="3"
              :disabled="loginApi.showLoading"
            >
              {{ $t('LOGIN.SUBMIT') }}
            </button>
          </form>

          <div class="cha-meta">
            {{ $t('LOGIN.NO_ACCOUNT') }}
            <a :href="signupUrl">{{ $t('LOGIN.CREATE_NEW_ACCOUNT') }}</a>
          </div>

          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="cha-legal" v-html="termsNote" />
        </div>

        <div v-else class="cha-spinner">
          <Spinner color-scheme="primary" size="" />
        </div>
      </template>
    </div>
  </main>
</template>
