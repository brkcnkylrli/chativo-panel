# Mobil Deneyim

Panel ağırlıklı olarak telefondan kullanılacak. Bugünkü mobil hâli masaüstü
arayüzünün daraltılmış bir kopyası: çalışıyor ama telefonda tasarlanmış gibi
durmuyor. Bu plan onu telefonda tasarlanmış hâle getirmeyi anlatıyor.

## Bugün ne yanlış (kodda okunanlar)

**1. Menü iki ayrı yerden açılıyor.** Sol altta yüzen bir düğme var
(`MobileSidebarLauncher.vue`) ve alt çubuğun en solunda "Menü" var
(`MobileBottomNav.vue`). İkisi aynı işi yapıyor. Kullanıcı hangisinin ne
olduğunu deneyerek öğreniyor ve yüzen düğme içeriğin üstünü kapatıyor.

**2. Menü 200 piksel.** `Sidebar.vue:900` sabit `w-[200px]`. Telefonda bu
ekranın yarısından az; "Konuşma Akışı", "Hazır Yanıtlar" gibi başlıklar
sığmıyor, alt menüler iyice sıkışıyor. Ekran görüntüsünde de görünen şey bu.

**3. Menü açıkken arkası kararmıyor.** Örtü katmanı yok. Menü içeriğin üstüne
biniyor ama arkadaki liste tam parlaklıkta duruyor; göz neye bakacağını
bilmiyor ve menü "yapışmış bir panel" gibi görünüyor, geçici bir katman gibi
değil.

**4. Menü yalnızca dokunarak kapanıyor.** Parmakla sola sürükleyip kapatmak
yok. Telefonda açılan her yan menünün beklenen davranışı bu.

**5. Sayfa geçişi yok.** Konuşma listesinden bir konuşmaya girmek anlık bir
sıçrama. Nereden nereye gidildiği görünmüyor; geri dönünce de aynı sıçrama.
Telefonda yön duygusu, masaüstündekinden çok daha önemli.

**6. Dokunma hedefleri küçük.** Menü satırları `py-1.5` (yaklaşık 30 piksel).
Parmak için kabul edilen alt sınır 44 piksel.

## Ne yapacağız

### 1. Tek giriş: alt çubuk

Yüzen düğme kalkıyor. Menüyü açan tek yer alt çubuktaki "Menü". Alt çubuk
zaten her ekranda duruyor, ikinci bir yüzen düğme hem gereksiz hem ekranı
yiyor.

### 2. Menü gerçek bir katman olsun

- Genişlik `min(84vw, 320px)`. Telefonda okunur, tablette abartılı değil.
- Arkasına karartma: dokununca kapanıyor, menüyle birlikte beliriyor.
- Sola sürükleyerek kapatma. Parmak takip ediyor, yarıdan fazla çekilirse
  kapanıyor, azsa geri yapışıyor.
- Alt kenarda telefonun kendi çubuğu için güvenli alan payı.

### 3. Alt çubuk: yaratıcılık burada

Bugün beş öge yan yana ve hepsi eşit. Yapılacaklar:

- **Etkin bölüm gerçekten belli olsun.** Bugün yalnızca renk ve dolu/çizgi
  ikon farkı var. Etkin ögenin altına ince bir işaret, ikonda hafif yukarı
  kayma. Renk körlüğünde de okunur olsun diye biçim + konum, sadece renk değil.
- **Dokunma geri bildirimi.** Basılı tutulduğunda ikon hafifçe küçülüyor.
  Telefonda "bastım mı" sorusu hiç sorulmamalı.
- **Sayaçlar sakinleşsin.** Bildirim rozeti bugün kırmızı bir daire; okunmamış
  konuşma sayısı için de aynısı gerekiyor ama üç ayrı kırmızı nokta panik
  havası veriyor. Bildirimde sayı, konuşmada yalnızca nokta.
- **Yeni konuşma.** Bugün mobilde yeni konuşma başlatmanın kısa yolu yok;
  menüyü açmak gerekiyor. Alt çubuğun ortasına gelecek.

### 4. Sayfa geçişleri

- **Konuşmaya girerken** sağdan kayarak gelsin, geri dönerken sola gitsin.
  Yığın hissi: nereye girdiğini ve nereden çıktığını parmak hatırlıyor.

  **İlk turda yapılmadı, ikinci tura bırakıldı.** Sebep: liste ile konuşma
  aynı Vue bileşeninin (`ConversationView`) içinde ve hangisinin görüneceği
  CSS görünürlüğüyle seçiliyor, ayrı iki rota değil. Yani yön animasyonu
  yapı değişikliği istiyor. Derleme 13 dakika sürdüğü için bunu ilk turun
  içine koymak, geri kalan her şeyi de riske atmak olurdu. Önce çalışan
  hâli telefondan görelim.
- **Alt çubuk sekmeleri arasında** kayma değil, kısa bir belirme. Sekmeler
  yan yana değil eşit; aralarında yön yok.
- **Menü** kendi kayma animasyonuyla zaten geliyor, süresi karartmayla
  eşitlenecek.
- Süreler kısa: 180-220 ms. Uzun animasyon ilk seferde hoş, onuncu seferde
  yavaş.
- **`prefers-reduced-motion` açıksa hepsi kapanıyor.** Hareket duyarlılığı
  olan kullanıcı için bu bir tercih değil, erişilebilirlik.

### 5. Dokunma hedefleri

Menü satırları ve alt çubuk ögeleri en az 44 piksel. Görsel yükseklik
değişmeden dokunma alanını büyütmek mümkün; satırlar seyrekleşmeyecek.

## Sınırlar (bilinçli)

- **Yalnızca mobil.** Masaüstü görünümü bu planda hiç değişmiyor;
  `md:` üstündeki her şey bugünkü hâlinde kalıyor.
- **Marka yaması yerinde kalıyor.** Renk ve metin işleri
  `chativo-metin-yamasi.rb` içinde; buraya yalnızca yapı değişikliği giriyor.
  Upstream Chatwoot ile birleştirmeyi zorlaştırmamak için kural bu.
- **Yeni kütüphane yok.** Animasyonlar CSS ile. Panelde zaten Vue geçiş
  bileşenleri var, yeni bir bağımlılık girmeyecek.
- **Chatwoot'un mobil uygulaması kapsam dışı.** O ayrı bir kod tabanı.

## Nasıl doğrulanacak

Panel derlemesi ~13 dakika sürüyor, yani "derle-bak-derle" yapılamaz. Bu
yüzden değişiklikler toplu gidecek ve **tek derlemede** çıkacak. Sonrasında
telefondan bakılıp düzeltme turu yapılacak.

Test edilecek: iPhone Safari (güvenli alan), Android Chrome, PWA standalone.
