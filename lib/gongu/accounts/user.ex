defmodule Gongu.Accounts.User do
  use Ash.Resource,
    otp_app: :gongu,
    domain: Gongu.Accounts,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshAuthentication]

  authentication do
    tokens do
      enabled? true
      token_resource Gongu.Accounts.Token
      signing_secret Gongu.Secrets
      store_all_tokens? true
      require_token_presence_for_authentication? true
    end

    strategies do
      # 개발용 이메일/비밀번호 인증
      password :password do
        identity_field :email
        hashed_password_field :hashed_password
      end

      # 카카오 로그인
      oauth2 :kakao do
        client_id fn _, _ ->
          {:ok, Application.get_env(:gongu, :kakao)[:client_id]}
        end

        redirect_uri fn _, _ ->
          {:ok, Application.get_env(:gongu, :kakao)[:redirect_uri]}
        end

        # 카카오는 기본적으로 client_secret이 필요 없지만,
        # Assent가 요구하므로 빈 값이라도 제공
        client_secret fn _, _ ->
          secret = Application.get_env(:gongu, :kakao)[:client_secret]

          if is_nil(secret) or secret == "" do
            {:ok, "not_required"}
          else
            {:ok, secret}
          end
        end

        base_url "https://kauth.kakao.com"
        authorize_url "https://kauth.kakao.com/oauth/authorize"
        token_url "https://kauth.kakao.com/oauth/token"
        user_url "https://kapi.kakao.com/v2/user/me"

        # authorization_params scope: "profile_nickname,account_email"

        identity_resource Gongu.Accounts.UserIdentity
      end

      # Apple 로그인
      oauth2 :apple do
        client_id fn _, _ ->
          {:ok, Application.get_env(:gongu, :apple)[:client_id]}
        end

        redirect_uri fn _, _ ->
          {:ok, Application.get_env(:gongu, :apple)[:redirect_uri]}
        end

        client_secret fn _, _ ->
          case Application.get_env(:gongu, :apple)[:client_secret] do
            "" -> {:ok, nil}
            nil -> {:ok, nil}
            secret -> {:ok, secret}
          end
        end

        base_url "https://appleid.apple.com"
        authorize_url "https://appleid.apple.com/auth/authorize"
        token_url "https://appleid.apple.com/auth/token"
        user_url "https://appleid.apple.com/auth/userinfo"

        authorization_params scope: "name email", response_mode: "form_post"

        identity_resource Gongu.Accounts.UserIdentity
      end
    end
  end

  postgres do
    table "users"
    repo Gongu.Repo
  end

  actions do
    defaults [:read, :destroy]

    read :get_by_subject do
      description "Get a user by the subject claim in a JWT"
      argument :subject, :string, allow_nil?: false
      get? true
      prepare AshAuthentication.Preparations.FilterBySubject
    end

    read :get_by_email do
      description "Looks up a user by their email"
      get? true

      argument :email, :ci_string do
        allow_nil? false
      end

      filter expr(email == ^arg(:email))
    end

    # OAuth 회원가입/로그인 액션
    create :register_with_kakao do
      description "Register or sign in with Kakao"
      argument :user_info, :map, allow_nil?: false
      argument :oauth_tokens, :map, allow_nil?: false
      upsert? true
      upsert_identity :unique_email

      change AshAuthentication.GenerateTokenChange
      change {AshAuthentication.Strategy.OAuth2.IdentityChange, strategy: :kakao}

      change fn changeset, _ ->
        user_info = Ash.Changeset.get_argument(changeset, :user_info)
        email = get_in(user_info, ["kakao_account", "email"])

        if email do
          Ash.Changeset.change_attribute(changeset, :email, email)
        else
          # 카카오에서 이메일을 못 받은 경우 임시 이메일 생성
          uid = to_string(get_in(user_info, ["id"]))
          Ash.Changeset.change_attribute(changeset, :email, "kakao_#{uid}@gongu.app")
        end
      end

      change after_action(fn _changeset, user, context ->
               ensure_default_calendar(user, context)
             end)

      metadata :token, :string do
        allow_nil? false
      end
    end

    create :register_with_apple do
      description "Register or sign in with Apple"
      argument :user_info, :map, allow_nil?: false
      argument :oauth_tokens, :map, allow_nil?: false
      upsert? true
      upsert_identity :unique_email

      change AshAuthentication.GenerateTokenChange
      change {AshAuthentication.Strategy.OAuth2.IdentityChange, strategy: :apple}

      change fn changeset, _ ->
        user_info = Ash.Changeset.get_argument(changeset, :user_info)
        email = get_in(user_info, ["email"])

        if email do
          Ash.Changeset.change_attribute(changeset, :email, email)
        else
          # Apple에서 이메일을 못 받은 경우 임시 이메일 생성
          sub = to_string(get_in(user_info, ["sub"]))
          Ash.Changeset.change_attribute(changeset, :email, "apple_#{sub}@gongu.app")
        end
      end

      change after_action(fn _changeset, user, context ->
               ensure_default_calendar(user, context)
             end)

      metadata :token, :string do
        allow_nil? false
      end
    end
  end

  policies do
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :email, :ci_string do
      allow_nil? false
      public? true
    end

    attribute :hashed_password, :string do
      allow_nil? true
      sensitive? true
    end
  end

  identities do
    identity :unique_email, [:email]
  end

  # 이메일에서 이름 부분 추출 (예: "user@example.com" -> "user")
  defp extract_email_name(email) do
    email
    |> to_string()
    |> String.split("@")
    |> List.first()
  end

  # 기본 캘린더가 없으면 생성
  defp ensure_default_calendar(user, _context) do
    calendar_name = extract_email_name(user.email)

    case Ash.read(Gongu.Groups.Calendar, actor: user) do
      {:ok, calendars} ->
        existing_calendar =
          Enum.find(calendars, fn cal ->
            cal.name == calendar_name && cal.owner_id == user.id
          end)

        if existing_calendar do
          {:ok, user}
        else
          Ash.create(
            Gongu.Groups.Calendar,
            %{
              name: calendar_name
            },
            action: :create,
            actor: user
          )
          |> case do
            {:ok, _calendar} -> {:ok, user}
            {:error, _error} -> {:ok, user}
          end
        end

      {:error, _error} ->
        {:ok, user}
    end
  end
end
