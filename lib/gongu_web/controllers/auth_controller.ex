defmodule GonguWeb.AuthController do
  use GonguWeb, :controller
  use AshAuthentication.Phoenix.Controller

  def success(conn, activity, user, _token) do
    return_to = get_session(conn, :return_to) || ~p"/"

    message =
      case activity do
        {:confirm_new_user, :confirm} -> "Your email address has now been confirmed"
        {:password, :reset} -> "Your password has successfully been reset"
        _ -> "You are now signed in"
      end

    # 모든 인증 방법에서 기본 캘린더 확인 및 생성 (로그인/회원가입 모두)
    ensure_default_calendar_for_user(user)

    conn
    |> delete_session(:return_to)
    |> store_in_session(user)
    # If your resource has a different name, update the assign name here (i.e :current_admin)
    |> assign(:current_user, user)
    |> put_flash(:info, message)
    |> redirect(to: return_to)
  end

  # 이메일에서 이름 부분 추출 (예: "user@example.com" -> "user")
  defp extract_email_name(email) do
    email
    |> to_string()
    |> String.split("@")
    |> List.first()
  end

  # 기본 캘린더가 없으면 생성
  defp ensure_default_calendar_for_user(user) do
    calendar_name = extract_email_name(user.email)

    case Ash.read(Gongu.Groups.Calendar, actor: user) do
      {:ok, calendars} ->
        existing_calendar =
          Enum.find(calendars, fn cal ->
            cal.name == calendar_name && cal.owner_id == user.id
          end)

        if existing_calendar do
          :ok
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
            {:ok, _calendar} -> :ok
            {:error, _error} -> :ok
          end
        end

      {:error, _error} ->
        :ok
    end
  end

  def failure(conn, activity, reason) do
    message =
      case {activity, reason} do
        {_,
         %AshAuthentication.Errors.AuthenticationFailed{
           caused_by: %Ash.Error.Forbidden{
             errors: [%AshAuthentication.Errors.CannotConfirmUnconfirmedUser{}]
           }
         }} ->
          """
          You have already signed in another way, but have not confirmed your account.
          You can confirm your account using the link we sent to you, or by resetting your password.
          """

        _ ->
          "Incorrect email or password"
      end

    conn
    |> put_flash(:error, message)
    |> redirect(to: ~p"/sign-in")
  end

  def sign_out(conn, _params) do
    return_to = get_session(conn, :return_to) || ~p"/sign-in"

    conn
    |> clear_session(:gongu)
    |> put_flash(:info, "You are now signed out")
    |> redirect(to: return_to)
  end
end
