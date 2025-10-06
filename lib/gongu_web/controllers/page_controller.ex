defmodule GonguWeb.PageController do
  use GonguWeb, :controller

  def index(conn, _params) do
    # 인증된 사용자만 접근 가능하도록 체크
    case conn.assigns[:current_user] do
      nil ->
        redirect(conn, to: ~p"/sign-in")

      _user ->
        render(conn, :index)
    end
  end
end
