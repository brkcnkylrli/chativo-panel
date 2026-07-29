# Chativo panel — arayuz duzeni planı

Tarih: 2026-07-29
Referans: rakip ekran goruntusu (dar etiketli serit + sekmeli liste + sag musteri ozeti)

## Mevcut durum (koddan dogrulandi)

- Sol menu tek bilesen: `app/javascript/dashboard/components-next/sidebar/Sidebar.vue`
  (1091 satir). Genislik `provider.js` icinde: varsayilan 200px, min 56px,
  daraltma esigi 160px, kullanicinin `sidebar_width` UI ayarinda saklaniyor.
- Daraltilinca ust duzey ikonlar kaliyor, alt ogeler `SidebarCollapsedPopover.vue`
  ile ucar menude aciliyor. Yani "dar serit + alt menu" altyapisi zaten var,
  eksik olan tek sey ikonun altindaki etiket ve kalici genislik.
- Menu agaci `menuItems` dizisinde tanimli: Konusmalar, Captain, Kisiler,
  Sirketler, Raporlar, Kampanyalar, Portal, Ayarlar.
- Liste basligi: `components/ChatListHeader.vue` (168 satir) — sadece baslik,
  sayac ve dort ikon dugme. Sekme satiri yok.
- Sag musteri paneli mevcut: `widgets/conversation/ConversationSidebar.vue`.
  Su an kapali durumda aciliyor.

## Yapilacaklar

### 1. Sol menu — 72px etiketli serit

- `provider.js`: `MIN_WIDTH` 56 -> 72, yeni sabit `RAIL_WIDTH = 72`.
- `Sidebar.vue`: daraltilmis durumda ust duzey oge = ikon (20px) + altinda
  11px etiket, iki satira tasarsa kirpilir. Oge yuksekligi ~56px.
- Aktif oge: dolu arka plan + yumusak kose (rakipteki beyaz kutu karsiligi),
  koyu temada `bg-n-alpha-3`.
- Alt oge acilimi mevcut popover ile kalir; hover yerine tiklama ile acilir
  (etiketli seritte hover ile acilma huzursuz ediyor).
- Alt blok: profil menusu + Ayarlar ayni serit dilinde, ince ayrac ustunde.
- Genislik hafizasi korunur: kullanici seridi surukleyip genis moda
  donebilir, yeni kurulumlarda varsayilan serit modudur.

### 2. Liste ustu sekmeler

- Rakipteki Tumu / VIP / Toptan / Kargo bekliyor satiri = Chatwoot'ta
  **kayitli filtreler** (folders). Kapali degiller, sadece kayitli filtre
  olmadigi icin gorunmuyorlar.
- `ChatListHeader.vue` altina yatay kaydirilabilir sekme satiri: ilk sekme
  "Tumu", ardindan kayitli filtreler, sonda "+" ile yeni filtre kaydetme.
- Aktif sekme alt cizgi ile isaretlenir; sayac rozetleri mevcut
  `conversationStats` ve klasor okunmamis sayaclarindan gelir.
- Filtre yoksa satir hic cizilmez (bos sekme seridi gorunmesin).

### 3. Liste ustundeki durum karti

- Ajanin musaitlik durumu + kisa not, listenin en ustunde tek satirlik kart.
- Veri kaynagi mevcut: profil menusundeki `SidebarProfileMenuStatus.vue`
  ayni store alanini kullaniyor, yeni API gerekmiyor.
- Kart tiklanınca durum secici acilir.

### 4. Sag musteri ozeti

- `ConversationSidebar` sohbet acilinca varsayilan olarak acik gelir
  (UI ayarinda saklanir, kullanici kapatirsa kapali kalir).
- Icerik sirasi rakiptekine yaklastirilir: kisi basligi, telefon/tur,
  sayisal ozet (siparis, ilk mesaj, son gorulme, toplam mesaj),
  konusma detaylari, olay zaman cizelgesi.
- Siparis gibi Chatwoot'ta karsiligi olmayan alanlar **ozel alan**
  (custom attribute) olarak gosterilir; olmayan alan hic cizilmez.

## Sira ve dogrulama

1. Sol menu (1) tek basina yapilir, sunucuda derlenir, ekran goruntusu alinir.
   Begenilmezse geri donus tek commit.
2. Onaydan sonra 2 + 3 birlikte (ikisi de liste basligi).
3. En son 4.

Derleme sunucuda ~13 dakika (bkz. reference_chativo_panel_fork). Her adim
ayri commit, marka/metin islerine dokunulmaz — onlar `chativo-metin-yamasi.rb`
icinde kalir.

## Verilen karar

Serit modunda "Konusmalar" alt ogeleri (Tum Konusmalar, Bana Etiketlenenler,
Cevap Bekleyen, Kanallar, Etiketler, Ekipler) **serite tiklayinca acilan ucar
menude kalir** (secenek A, 2026-07-29). Sekme satiri oturduktan sonra bir
kismini sekmelere tasima secenegi acik kalir.
