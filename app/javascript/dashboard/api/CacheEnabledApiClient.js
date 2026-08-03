/* global axios */
import { DataManager } from '../helper/CacheHelper/DataManager';
import ApiClient from './ApiClient';

/**
 * Ayni anda ucan `cache_keys` isteklerini tek istege indirir.
 *
 * Onbellekli her model (label, inbox, team) kendi `getFromCache` akisinda ayri
 * bir `cache_keys` istegi yapiyordu, ama uc zaten UCUNUN anahtarini birden
 * donuyor. Olculdugunde bu, on sayfa yuklemesinde kirk dort istek demekti -
 * en cok cagrilan uc buydu ve her biri ~180 ms ag turu oduyordu. Yani onbellek
 * mekanizmasi, tasarruf ettiginden fazla istek uretiyordu.
 *
 * Birlestirme **suresiz degil, ucus suresince**: istek bitince kayit siliniyor,
 * yani bir sonraki acilis taze anahtar aliyor. Once zaman pencereli (1 sn) bir
 * surum yazildi ve o, modul duzeyinde durum tuttugu icin testler arasina
 * siziyordu - bir testin cevabi digerine gorunuyordu. Ucus suresi hem yeterli
 * (uc model acilista birlikte istiyor) hem de bittiginde arkasinda durum
 * birakmiyor.
 */
const ucanCacheKeysIstekleri = new Map();

function cacheKeysGetir(accountId) {
  const ucan = ucanCacheKeysIstekleri.get(accountId);
  if (ucan) return ucan;

  const istek = axios
    .get(`/api/v1/accounts/${accountId}/cache_keys`)
    .finally(() => ucanCacheKeysIstekleri.delete(accountId));

  ucanCacheKeysIstekleri.set(accountId, istek);

  return istek;
}

class CacheEnabledApiClient extends ApiClient {
  constructor(resource, options = {}) {
    super(resource, options);
    this.dataManager = new DataManager(this.accountIdFromRoute);
  }

  // eslint-disable-next-line class-methods-use-this
  get cacheModelName() {
    throw new Error('cacheModelName is not defined');
  }

  get(cache = false) {
    if (cache) {
      return this.getFromCache();
    }

    return this.getFromNetwork();
  }

  getFromNetwork() {
    return axios.get(this.url);
  }

  // eslint-disable-next-line class-methods-use-this
  extractDataFromResponse(response) {
    return response.data.payload;
  }

  // eslint-disable-next-line class-methods-use-this
  marshallData(dataToParse) {
    return { data: { payload: dataToParse } };
  }

  async getFromCache() {
    try {
      // IDB is not supported in Firefox private mode: https://bugzilla.mozilla.org/show_bug.cgi?id=781982
      await this.dataManager.initDb();
    } catch {
      return this.getFromNetwork();
    }

    const { data } = await cacheKeysGetir(this.accountIdFromRoute);
    const cacheKeyFromApi = data.cache_keys[this.cacheModelName];
    const isCacheValid = await this.validateCacheKey(cacheKeyFromApi);

    // Anahtar yoksa ya da tutmuyorsa veri bayat: agdan cekilip yeniden yazilir.
    //
    // "Anahtar yok" ayrica ele aliniyor: sunucu bu model icin anahtar
    // dondurmediginde yereldeki anahtar da tanimsiz oluyor ve iki tanimsiz
    // birbirine esit cikip onbellek "gecerli" sayiliyordu. Eski kod bunu
    // `localData.length === 0` yedegiyle ortuyordu; o yedek kalkinca durum
    // gorunur hale geldi ve dogru cevap onbellegi gecersiz saymak.
    if (!cacheKeyFromApi || !isCacheValid) {
      return this.refetchAndCommit(cacheKeyFromApi);
    }

    // Anahtar tutuyorsa yereldeki veri dogru - **bos olsa bile**.
    //
    // Onceden burada `localData.length === 0` ise agdan cekiliyordu ve bu,
    // "onbellek yok" ile "koleksiyon bos" durumlarini ayni sayiyordu. Sonuc:
    // hic etiketi ya da ekibi olmayan bir hesapta bu iki uc HER sayfa
    // yuklemesinde yeniden cagriliyordu; hicbir zaman onbellege girmiyorlardi
    // cunku onbellege girecek bir sey yoktu. Olculdugunde `inboxes` (3 kayit)
    // bir kez, `labels` ve `teams` (0 kayit) on ve on iki kez cagriliyordu.
    //
    // Bos liste de gecerli bir cevap; anahtarin kendisi zaten "degisti mi"
    // sorusunu cevapliyor. Etiket eklendiginde sunucudaki anahtar degisiyor
    // (`AccountCacheRevalidator`), anahtar tutmuyor ve veri yeniden iniyor.
    const localData = await this.dataManager.get({
      modelName: this.cacheModelName,
    });

    return this.marshallData(localData);
  }

  async refetchAndCommit(newKey = null) {
    const response = await this.getFromNetwork();

    try {
      await this.dataManager.initDb();

      this.dataManager.replace({
        modelName: this.cacheModelName,
        data: this.extractDataFromResponse(response),
      });

      await this.dataManager.setCacheKeys({
        [this.cacheModelName]: newKey,
      });
    } catch {
      // Ignore error
    }

    return response;
  }

  async validateCacheKey(cacheKeyFromApi) {
    if (!this.dataManager.db) {
      await this.dataManager.initDb();
    }

    const cachekey = await this.dataManager.getCacheKey(this.cacheModelName);
    return cacheKeyFromApi === cachekey;
  }
}

export default CacheEnabledApiClient;
