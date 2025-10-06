defmodule GonguWeb.OAuthController do
  use GonguWeb, :controller

  @dev_mode Application.compile_env(:gongu, :dev_routes)

  def sign_in(conn, _params) do
    conn
    |> assign(:dev_mode, @dev_mode)
    |> render(:sign_in)
  end

  def sign_up(conn, _params) do
    conn
    |> assign(:dev_mode, @dev_mode)
    |> render(:sign_up)
  end
end
