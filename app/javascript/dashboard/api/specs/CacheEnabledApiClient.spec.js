import axios from 'axios';
import CacheEnabledApiClient from '../CacheEnabledApiClient';

global.axios = axios;
vi.mock('axios');

/**
 * Onbellekli istemcinin iki davranisi burada kilitleniyor:
 *
 * - **Bos koleksiyon da onbelleklenebilir.** Onceden "yerelde kayit yok" ile
 *   "onbellek yok" ayni sayiliyordu; hic etiketi olmayan bir hesapta bu uc
 *   her sayfa yuklemesinde yeniden cagriliyordu ve hicbir zaman onbellege
 *   girmiyordu. Canlida olculdu: `inboxes` (3 kayit) bir kez, `labels` ve
 *   `teams` (0 kayit) on ve on iki kez.
 * - **`cache_keys` ayni anda bir kez isteniyor.** Uc model de ayni ucu ayri
 *   ayri cagiriyordu; on sayfa yuklemesinde kirk dort istek demekti.
 */

// Duz nesne, sinif degil: dosyada tek sinif olmali (max-classes-per-file).
const sahteVeriYoneticisi = () => ({
  db: {},
  kayitlar: [],
  anahtar: undefined,
  yazilanVeri: null,
  async initDb() {
    return this.db;
  },
  async get() {
    return this.kayitlar;
  },
  async getCacheKey() {
    return this.anahtar;
  },
  async setCacheKeys(anahtarlar) {
    this.anahtar = Object.values(anahtarlar)[0];
  },
  replace({ data }) {
    this.yazilanVeri = data;
  },
});

class TestClient extends CacheEnabledApiClient {
  constructor() {
    super('labels', { accountScoped: true });
  }

  // eslint-disable-next-line class-methods-use-this
  get cacheModelName() {
    return 'label';
  }
}

const ETIKETLER = [{ id: 1, title: 'destek' }];

function istemciKur({ yerelKayitlar = [], yerelAnahtar } = {}) {
  const istemci = new TestClient();
  const yonetici = sahteVeriYoneticisi();
  yonetici.kayitlar = yerelKayitlar;
  yonetici.anahtar = yerelAnahtar;
  istemci.dataManager = yonetici;
  return { istemci, yonetici };
}

describe('CacheEnabledApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('anahtar tutuyorsa ve yerel veri BOS ise aga gitmiyor', async () => {
    const cagrilar = [];
    axios.get = vi.fn(url => {
      cagrilar.push(url);
      if (url.endsWith('/cache_keys')) {
        return Promise.resolve({ data: { cache_keys: { label: 'abc' } } });
      }
      return Promise.resolve({ data: { payload: ETIKETLER } });
    });

    const { istemci } = istemciKur({ yerelKayitlar: [], yerelAnahtar: 'abc' });
    const sonuc = await istemci.get(true);

    expect(sonuc.data.payload).toEqual([]);
    expect(cagrilar.filter(u => u.includes('labels'))).toHaveLength(0);
  });

  it('anahtar tutmuyorsa agdan cekiyor ve yeni anahtari yaziyor', async () => {
    axios.get = vi.fn(url => {
      if (url.endsWith('/cache_keys')) {
        return Promise.resolve({ data: { cache_keys: { label: 'yeni' } } });
      }
      return Promise.resolve({ data: { payload: ETIKETLER } });
    });

    const { istemci, yonetici } = istemciKur({ yerelAnahtar: 'eski' });
    const sonuc = await istemci.get(true);

    expect(sonuc.data.payload).toEqual(ETIKETLER);
    expect(yonetici.anahtar).toBe('yeni');
  });

  it('sunucu bu model icin anahtar dondurmezse onbellek gecerli sayilmiyor', async () => {
    // Iki tanimsiz deger birbirine esit cikip onbellegi "gecerli" gosteriyordu.
    axios.get = vi.fn(url => {
      if (url.endsWith('/cache_keys')) {
        return Promise.resolve({ data: { cache_keys: {} } });
      }
      return Promise.resolve({ data: { payload: ETIKETLER } });
    });

    const { istemci } = istemciKur({
      yerelKayitlar: [],
      yerelAnahtar: undefined,
    });
    const sonuc = await istemci.get(true);

    expect(sonuc.data.payload).toEqual(ETIKETLER);
  });

  it('ayni anda ucan cagrilar tek cache_keys istegi yapiyor', async () => {
    let cacheKeysSayisi = 0;
    axios.get = vi.fn(url => {
      if (url.endsWith('/cache_keys')) {
        cacheKeysSayisi += 1;
        return new Promise(cozumle => {
          setTimeout(
            () => cozumle({ data: { cache_keys: { label: 'abc' } } }),
            10
          );
        });
      }
      return Promise.resolve({ data: { payload: ETIKETLER } });
    });

    const { istemci: a } = istemciKur({ yerelAnahtar: 'abc' });
    const { istemci: b } = istemciKur({ yerelAnahtar: 'abc' });
    const { istemci: c } = istemciKur({ yerelAnahtar: 'abc' });

    await Promise.all([a.get(true), b.get(true), c.get(true)]);

    expect(cacheKeysSayisi).toBe(1);
  });

  it('ucus bitince kayit siliniyor: sonraki acilis taze anahtar aliyor', async () => {
    let cacheKeysSayisi = 0;
    axios.get = vi.fn(url => {
      if (url.endsWith('/cache_keys')) {
        cacheKeysSayisi += 1;
        return Promise.resolve({ data: { cache_keys: { label: 'abc' } } });
      }
      return Promise.resolve({ data: { payload: ETIKETLER } });
    });

    const { istemci } = istemciKur({ yerelAnahtar: 'abc' });
    await istemci.get(true);
    await istemci.get(true);

    expect(cacheKeysSayisi).toBe(2);
  });
});
