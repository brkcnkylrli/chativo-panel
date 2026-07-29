# Panel Arayuz Turu 2 - Duzen ve Hiyerarsi

Tur 1 marka sizintisini kapatti (renk, terim, ikon, menu). Bu tur **duzen**
isi: panelin "eski yazilim" hissini veren yerlestirme ve olcek sorunlari.

Kaynak: 2026-07-29 tarihli panel ekran goruntusu (koyu tema, konusma ekrani).

## Ilke

Tek bir yuzey olcegi, tek bir yazi olcegi, hairline ayiricilar. Vurgu rengi
yalnizca **eylem** ve **secim** icin - icerik tasimak icin degil.

## 1. Yuzey ve ayirici olcegi

Bugun dort farkli gri keyfi kullaniliyor (serit, liste, mesaj alani, kart).
Uc kademeye indirilecek:

| Kademe | Kullanim |
|---|---|
| `zemin` | mesaj alani, sayfa arka plani |
| `yuzey` | konusma listesi, sag panel |
| `yukseltilmis` | yanit kutusu, acilir menu, secili satir |

Ayiricilar hairline (1px, dusuk kontrast) - kutu cercevesi degil. Sag paneldeki
kart cerceveleri tamamen kalkacak.

## 2. Konusma listesi satiri

- **Hiyerarsi duzelt:** isim birinci satir, onizleme ikinci satir. Kanal adi
  metin olarak tekrar etmeyecek; kucuk ikon olarak isimle ayni satirda durur.
- **Tek zaman damgasi.** Bugun iki tane var (`23h - 23h`) ve hangisinin ne
  oldugu belli degil. Son hareket zamani kalir.
- Onizleme onundeki `←` glifi kaldirilir; giden mesaj oldugunu belirtmek
  gerekiyorsa soluk "Siz:" oneki kullanilir.
- **Avatar:** rastgele doygun renkler yerine notr zemin + monogram. Renk
  yalnizca okunmamis rozetinde.
- **Secili satir:** dolgu degisimi + soldan tam yukseklikte vurgu cizgisi
  (bugun kesik gorunuyor).
- Satir yuksekligi ve dolgu tek degere sabitlenir.

## 3. Liste basligi ve filtreler

Iki ayri filtre sistemi ust uste duruyor: cip satiri (`Tumu / asd`) ve sayac
satiri (`Benim / Atanmamis / Hepsi`). Tek satirda birlestirilecek; sayaclar
secili olmayan sekmelerde soluk.

Baslikta dort ikon sikisik duruyor - az kullanilanlar tek menuye toplanir
(tur 1'de yanit kutusunda yapilan sey).

## 4. Mesaj balonu

En cok "eski" hissi veren yer burasi.

- **Genislik tavani ~62 karakter.** Bugun balon sutunun tamamini kapliyor.
- **Dolu mor blok kalkiyor.** Giden mesaj: marka tonlu ama dusuk doygunlukta
  yuzey; gelen mesaj: notr yuzey. Ayrim hizalama + kontrastla, dolgu rengiyle
  degil. Uzun AI cevaplarinda mor duvar olusmayacak.
- Kose yaricapi buyutulur, ardisik mesajlarda gruplanma (ilk/orta/son balon
  farkli yaricap).
- **Avatar balonun disinda kesik duruyor** - hizalanacak veya grup basina tek
  avatar gosterilecek.
- **Tarih ayraci** eklenir (bugun yok).
- Saat ve tik bilgisi kucultulur, kontrasti dusurulur.

## 5. Yanit kutusu

- ~200 piksellik olu bosluk kalkar; kutu icerige gore buyur (min 2 satir).
- Uzun talimat metni (`Yeni satir icin Shift + enter...`) kisaltilir, ipucu
  olarak alt satira alinir.
- Metin alaninin altinda yuzen tek yuvarlak buton yanlis konumda - arac
  seridine tasinir.
- `Cevapla / Ozel Not` cip yerine sade sekme; ozel notta zemin tonu degisir.

## 6. Sag panel

- Sekiz kapali akordiyon yerine: `Konusma Bilgisi` ve `Onceki Konusmalar`
  varsayilan acik, kalanlar kapali. Kutu cercevesi yok, hairline ayrac.
- **Bos alanlar gizlenir.** Bugun uc satir "Musait degil" yaziyor (e-posta,
  telefon, sirket bos). Bos alan gosterilmez; hicbiri yoksa tek satir
  "Iletisim bilgisi yok".
- Dort kare eylem ikonu (biri kirmizi) sadelestirilir; silme ikincil menuye.

## Kapsam disi

- Acik tema (once koyu tema bitecek, sonra ayni degerler acik temaya)
- Widget gorunumu (ayri is)
- Rapor ekranlari

## Yontem

Degisiklikler koda girer, CSS mount'u ile degil (bkz
`reference_chativo_panel_renk_ve_css`). Her madde ayri commit; hepsi bitince
sunucuda **tek derleme** (~13 dk) ve tek dogrulama turu.
