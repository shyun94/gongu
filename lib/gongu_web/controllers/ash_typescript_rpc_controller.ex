defmodule GonguWeb.AshTypescriptRpcController do
  use GonguWeb, :controller

  def run(conn, params) do
    # Actor를 현재 사용자로 설정
    conn = Ash.PlugHelpers.set_actor(conn, conn.assigns[:current_user])

    result = AshTypescript.Rpc.run_action(:gongu, conn, params)
    json(conn, result)
  end

  def validate(conn, params) do
    # Actor를 현재 사용자로 설정
    conn = Ash.PlugHelpers.set_actor(conn, conn.assigns[:current_user])

    result = AshTypescript.Rpc.validate_action(:gongu, conn, params)
    json(conn, result)
  end
end
