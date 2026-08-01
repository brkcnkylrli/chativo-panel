import { frontendURL } from 'dashboard/helper/URLHelper';
import { clearBrowserSessionCookies } from 'dashboard/store/utils/api';
import { hasAuthCookie } from './AuthHelper';
import { DEFAULT_REDIRECT_URL } from 'dashboard/constants/globals';
import { replaceRouteWithReload } from './CommonHelper';

/**
 * Chativo eki: panelin kendi kayit ekrani kullanilmiyor.
 *
 * Musteriler chativo.tr/kayit uzerinden kaydoluyor; orada plan secimi,
 * deneme suresi ve WhatsApp baglama akisi birlikte kuruluyor. Chatwoot'un
 * ham kayit formu bunlarin hicbirini yapmadigi icin iki ayri kayit yolu
 * olusuyordu. Adres dogrudan yazilsa bile disariya cikiyoruz.
 *
 * Adres burada sabit: kurulum tek bir markaya ait ve fork'ta ayni desen
 * zaten kullaniliyor. Ortam degiskenine tasimak, degiskeni on yuze de
 * tasimak demek olurdu.
 */
export const CHATIVO_SIGNUP_URL = 'https://chativo.tr/kayit';

const validateSSOLoginParams = to => {
  const isLoginRoute = to.name === 'login';
  const { email, sso_auth_token: ssoAuthToken } = to.query || {};
  const hasValidSSOParams = email && ssoAuthToken;
  return isLoginRoute && hasValidSSOParams;
};

export const validateRouteAccess = (to, next, chatwootConfig = {}) => {
  // Pages with ignoreSession:true would be rendered
  // even if there is an active session
  // Used for confirmation or password reset pages
  if (to.meta && to.meta.ignoreSession) {
    next();
    return;
  }

  if (validateSSOLoginParams(to)) {
    clearBrowserSessionCookies();
    next();
    return;
  }

  // Redirect to dashboard if a cookie is present, the cookie
  // cleanup and token validation happens in the application pack.
  if (hasAuthCookie()) {
    replaceRouteWithReload(DEFAULT_REDIRECT_URL);
    return;
  }

  // Chativo: kayit ekranina her gidis disaridaki kayit sayfasina cikiyor.
  // Panelde kayit kapali oldugu icin burasi eskiden giris ekranina
  // dusuruyordu; musterinin kaydolacak bir yeri kalmiyordu.
  if (to.meta && to.meta.requireSignupEnabled) {
    window.location.replace(CHATIVO_SIGNUP_URL);
    return;
  }

  // If the URL is an invalid path, redirect to login page
  // Disable navigation to signup page if signups are disabled
  // Signup route has an attribute (requireSignupEnabled) in it's definition
  const isAnInalidSignupNavigation =
    chatwootConfig.signupEnabled !== 'true' &&
    to.meta &&
    to.meta.requireSignupEnabled;

  // Disable navigation to SAML login if enterprise is not enabled
  // SAML route has an attribute (requireEnterprise) in it's definition
  const isEnterpriseOnlyPath =
    chatwootConfig.isEnterprise !== 'true' &&
    to.meta &&
    to.meta.requireEnterprise;

  if (!to.name || isAnInalidSignupNavigation || isEnterpriseOnlyPath) {
    next(frontendURL('login'));
    return;
  }

  next();
};

export const isOnOnboardingView = route => {
  const { name = '' } = route || {};

  if (!name) {
    return false;
  }

  return name.includes('onboarding_');
};
