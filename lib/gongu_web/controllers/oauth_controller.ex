defmodule GonguWeb.OAuthController do
  use GonguWeb, :controller

  def sign_in(conn, _params) do
    render(conn, :sign_in)
  end
end
