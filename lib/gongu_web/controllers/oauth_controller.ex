defmodule GonguWeb.OAuthController do
  use GonguWeb, :controller

  @dev_mode Application.compile_env(:gongu, :dev_routes)

  def sign_in(conn, _params) do
    show_email_login = @dev_mode || is_admin?(conn)

    conn
    |> assign(:show_email_login, show_email_login)
    |> render(:sign_in)
  end

  def sign_up(conn, _params) do
    show_email_login = @dev_mode || is_admin?(conn)

    conn
    |> assign(:show_email_login, show_email_login)
    |> render(:sign_up)
  end

  defp is_admin?(conn) do
    case conn.cookies["is_admin"] do
      "true" -> true
      _ -> false
    end
  end
end
