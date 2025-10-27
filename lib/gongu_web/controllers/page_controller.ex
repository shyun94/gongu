defmodule GonguWeb.PageController do
  use GonguWeb, :controller

  def index(%{assigns: %{current_user: nil}} = conn, _params) do
    redirect(conn, to: ~p"/sign-in")
  end

  def index(%{assigns: %{current_user: _user}} = conn, _params) do
    render(conn, :index)
  end
end
