defmodule Gongu.Accounts do
  use Ash.Domain, otp_app: :gongu, extensions: [AshAdmin.Domain]

  admin do
    show? true
  end

  resources do
    resource Gongu.Accounts.Token
    resource Gongu.Accounts.User
  end
end
