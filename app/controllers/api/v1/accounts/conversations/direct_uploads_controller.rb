class Api::V1::Accounts::Conversations::DirectUploadsController < ActiveStorage::DirectUploadsController
  include ChativoApiAccess
  include DeviseTokenAuth::Concerns::SetUserByToken
  include RequestExceptionHandler
  include AccessTokenAuthHelper
  include EnsureCurrentAccountHelper

  skip_before_action :verify_authenticity_token, if: :authenticate_by_access_token?

  around_action :handle_with_exception
  before_action :authenticate_access_token!, if: :authenticate_by_access_token?
  before_action :validate_bot_access_token!, if: :authenticate_by_access_token?
  before_action :authenticate_user!, unless: :authenticate_by_access_token?
  before_action :current_account
  before_action :validate_token_api_access, if: :authenticate_by_access_token?
  before_action :conversation
  before_action :validate_storage_limit

  def create
    return if @conversation.nil? || @current_account.nil?

    super
  end

  private

  def authenticate_by_access_token?
    request.headers[:api_access_token].present? || request.headers[:HTTP_API_ACCESS_TOKEN].present?
  end

  def validate_token_api_access
    return if chativo_api_access_allowed?(Current.account)

    render_api_access_disabled
  end

  # Chativo plan siniri.
  #
  # Yalnizca temsilcinin panelden yaptigi yuklemeler kontrol ediliyor; musteriden
  # **gelen** medya bu uctan gecmiyor ve bilincli olarak engellenmiyor - gelen bir
  # fotografi reddetmek mesaji kaybetmek olur.
  def validate_storage_limit
    return if Current.account.nil?
    return unless Current.account.chativo_limit_reached?(:storage_bytes, Current.account.chativo_storage_used)

    limit = ActiveSupport::NumberHelper.number_to_human_size(Current.account.usage_limits[:storage_bytes])
    render json: { error: I18n.t('errors.storage.limit_reached', limit: limit) }, status: :unprocessable_entity
  end

  def conversation
    @conversation ||= Current.account.conversations.find_by(display_id: params[:conversation_id])
  end
end
