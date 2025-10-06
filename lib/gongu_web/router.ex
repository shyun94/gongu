defmodule GonguWeb.Router do
  use GonguWeb, :router

  use AshAuthentication.Phoenix.Router

  import AshAuthentication.Plug.Helpers

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {GonguWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :load_from_session
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :load_from_bearer
    plug :set_actor, :user
  end

  scope "/", GonguWeb do
    pipe_through :browser

    ash_authentication_live_session :authenticated_routes do
      # in each liveview, add one of the following at the top of the module:
      #
      # If an authenticated user must be present:
      # on_mount {GonguWeb.LiveUserAuth, :live_user_required}
      #
      # If an authenticated user *may* be present:
      # on_mount {GonguWeb.LiveUserAuth, :live_user_optional}
      #
      # If an authenticated user must *not* be present:
      # on_mount {GonguWeb.LiveUserAuth, :live_no_user}
    end
  end

  scope "/", GonguWeb do
    pipe_through :browser

    # React 앱 메인 페이지 (인증 필요)
    get "/", PageController, :index

    # Budget Calendar 페이지 (인증 필요)
    get "/budget-calendar", PageController, :index

    # OAuth 인증 라우트 (자동 생성됨)
    auth_routes AuthController, Gongu.Accounts.User, path: "/auth"
    sign_out_route AuthController

    # 커스텀 로그인 페이지
    get "/sign-in", OAuthController, :sign_in
  end

  # RPC endpoints for AshTypescript
  scope "/rpc", GonguWeb do
    pipe_through :browser

    post "/run", AshTypescriptRpcController, :run
    post "/validate", AshTypescriptRpcController, :validate
  end

  # Other scopes may use custom stacks.
  # scope "/api", GonguWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:gongu, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: GonguWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end

    # 개발용 회원가입 페이지 (개발 환경에서만 접근 가능)
    scope "/", GonguWeb do
      pipe_through :browser
      get "/sign-up", OAuthController, :sign_up
    end
  end

  if Application.compile_env(:gongu, :dev_routes) do
    import AshAdmin.Router

    scope "/admin" do
      pipe_through :browser

      ash_admin "/"
    end
  end
end
