# Hesabin API kapisini denetler.
#
# Chativo'da API erisimi plana bagli: musterinin kendi API token'i hiz limiti
# olmayan bir kapi ve suistimalin en kolay yolu, o yuzden yalnizca Kurumsal
# planda aciliyor.
#
# Ama kapinin kapsami dogru tanimlanmali. Chatwoot'un kendi kontrolu "bu hesaba
# gelen her token" diyor; oysa **koprunun servis hesabi da token kullaniyor**.
# Kapi kapandiginda musteriyi degil once bizi kesiyordu: gelen WhatsApp mesaji
# Chatwoot'a yazilamiyor, kurulum uzlastirmasi calismiyor, silme oncesi arsiv
# alinamiyor ve panele surekli yanlis "hesaba erisilemiyor" uyarisi dusuyordu.
# Yani urun, API'si kapali uc planda (deneme, baslangic, profesyonel) tumuyle
# calismiyordu.
#
# Dogru kisit: **musterinin urettigi** token. Servis hesabi muaf.
module ChativoApiAccess
  extend ActiveSupport::Concern

  private

  def chativo_api_access_allowed?(account)
    return true if account.blank?
    return true if account.api_and_webhooks_enabled?

    chativo_service_user?
  end

  # Koprunun servis kullanicisi mi.
  #
  # E-posta ile tanimlaniyor cunku kullanici kimligi kurulumdan kuruluma
  # degisiyor. Birden fazla adres virgulle verilebilir.
  def chativo_service_user?
    adresler = ENV.fetch('CHATIVO_SERVICE_EMAILS', 'sistem@chativo.tr')
                  .split(',').map { |e| e.strip.downcase }.reject(&:blank?)
    return false if adresler.blank?

    eposta = Current.user&.email&.downcase
    eposta.present? && adresler.include?(eposta)
  end

  def render_api_access_disabled
    render json: { error: 'API access is not enabled for this account' }, status: :forbidden
  end
end
