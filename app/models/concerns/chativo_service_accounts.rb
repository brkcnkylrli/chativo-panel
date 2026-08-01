# Koprunun servis kullanicisini tanir.
#
# Chativo her musteri hesabina kendi servis kullanicisini (sistem@chativo.tr)
# yonetici olarak ekliyor: gelen WhatsApp mesajini panele yazan, kurulumu
# uzlastiran, plan sinirlarini isleyen o kullanici.
#
# Bu kullanici **musterinin koltugu degil**. Ama Chatwoot koltuk sayarken
# hesabin tum uyelerini sayiyordu, yani her planda bir koltugu biz yiyorduk:
# Deneme'de 1 koltuk verilip 0 kullanilabiliyor, Baslangic'ta 2 verilip 1,
# Profesyonel'de 5 verilip 4. Musteri odedigi koltugu alamiyordu ve deneme
# hesabinda kendi ekibinden kimseyi ekleyemiyordu.
#
# Ayni e-posta listesi API muafiyetinde de kullaniliyor (ChativoApiAccess);
# tek kaynak burada dursun diye ayri bir modul.
module ChativoServiceAccounts
  module_function

  # Servis adresleri. Kullanici kimligi kurulumdan kuruluma degistigi icin
  # e-posta ile tanimlaniyor; birden fazlasi virgulle verilebilir.
  def emails
    ENV.fetch('CHATIVO_SERVICE_EMAILS', 'sistem@chativo.tr')
       .split(',').map { |e| e.strip.downcase }.reject(&:blank?)
  end

  # Hesabin koltuk sayimina giren uye sayisi: servis kullanicilari haric.
  def billable_user_count(account)
    adresler = emails
    return account.account_users.count if adresler.blank?

    account.account_users.joins(:user).where.not(users: { email: adresler }).count
  end
end
