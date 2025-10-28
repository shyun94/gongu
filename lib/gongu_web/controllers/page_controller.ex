defmodule GonguWeb.PageController do
  use GonguWeb, :controller

  def index(%{assigns: %{current_user: nil}} = conn, _params) do
    redirect(conn, to: ~p"/sign-in")
  end

  def index(%{assigns: %{current_user: user}} = conn, _params) do
    if has_group?(user) do
      redirect(conn, to: ~p"/budget-calendar")
    else
      redirect(conn, to: ~p"/onboarding")
    end
  end

  def onboarding(conn, _params) do
    render(conn, :index)
  end

  def budget_calendar(conn, _params) do
    render(conn, :index)
  end

  def groups(conn, _params) do
    render(conn, :index)
  end

  def settings(conn, _params) do
    render(conn, :index)
  end

  defp has_group?(user) do
    case Ash.read!(Gongu.Groups.GroupMembership, actor: user) do
      [] ->
        false

      memberships ->
        memberships
        |> Enum.any?(&(&1.status == :active))
    end
  end
end
