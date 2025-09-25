defmodule GonguWeb.AshTypescriptRpcController do
  use GonguWeb, :controller

  def run(conn, params) do
    result = AshTypescript.Rpc.run_action(:gongu, conn, params)
    json(conn, result)
  end

  def validate(conn, params) do
    result = AshTypescript.Rpc.validate_action(:gongu, conn, params)
    json(conn, result)
  end
end
