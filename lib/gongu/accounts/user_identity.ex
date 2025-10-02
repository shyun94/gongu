defmodule Gongu.Accounts.UserIdentity do
  use Ash.Resource,
    otp_app: :gongu,
    domain: Gongu.Accounts,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshAuthentication.UserIdentity]

  user_identity do
    user_resource Gongu.Accounts.User
  end

  postgres do
    table "user_identities"
    repo Gongu.Repo
  end

  actions do
    defaults [:read, :destroy]
  end

  attributes do
    uuid_primary_key :id
    create_timestamp :inserted_at
    update_timestamp :updated_at
  end
end
