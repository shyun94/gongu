defmodule Gongu.Groups.Event do
  use Ash.Resource,
    otp_app: :gongu,
    domain: Gongu.Groups,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "events"
    repo Gongu.Repo
  end

  actions do
    defaults [:read, :destroy]

    read :get_event do
      get? true

      argument :id, :uuid do
        allow_nil? false
      end

      filter expr(id == ^arg(:id))
    end

    create :create do
      accept [
        :title,
        :description,
        :start_time,
        :end_time,
        :all_day,
        :location,
        :calendar_id,
        :recurrence_rule,
        :status
      ]

      change set_attribute(:created_by_id, actor(:id))

      change fn changeset, context ->
        require Ash.Query

        calendar_id = Ash.Changeset.get_attribute(changeset, :calendar_id)
        actor_id = context.actor.id

        case Gongu.Groups.Calendar
             |> Ash.Query.filter(expr(id == ^calendar_id))
             |> Ash.read_one(action: :read, actor: context.actor) do
          {:ok, calendar} ->
            if calendar.owner_id == actor_id do
              changeset
            else
              case calendar.group_id do
                nil ->
                  Ash.Changeset.add_error(changeset,
                    field: :calendar_id,
                    message: "이 캘린더에 일정을 추가할 권한이 없습니다"
                  )

                group_id ->
                  case Gongu.Groups.GroupMembership
                       |> Ash.Query.filter(expr(group_id == ^group_id and user_id == ^actor_id))
                       |> Ash.read_one(action: :read, actor: context.actor) do
                    {:ok, _membership} ->
                      changeset

                    _ ->
                      Ash.Changeset.add_error(changeset,
                        field: :calendar_id,
                        message: "이 캘린더에 일정을 추가할 권한이 없습니다"
                      )
                  end
              end
            end

          {:error, _} ->
            Ash.Changeset.add_error(changeset,
              field: :calendar_id,
              message: "캘린더를 찾을 수 없습니다"
            )
        end
      end
    end

    update :update do
      accept [
        :title,
        :description,
        :start_time,
        :end_time,
        :all_day,
        :location,
        :recurrence_rule,
        :status
      ]
    end
  end

  policies do
    # 일정 읽기는 캘린더 소유자 또는 그룹 멤버만 가능
    policy action_type(:read) do
      authorize_if expr(calendar.owner_id == ^actor(:id))
      authorize_if expr(calendar.group.memberships.user_id == ^actor(:id))
    end

    # 일정 생성은 인증된 사용자만 가능
    # create 액션에서는 relationship 필터를 사용할 수 없으므로,
    # 인증된 사용자만 허용하고 실제 권한 검사는 application 레벨에서 처리
    policy action_type(:create) do
      authorize_if actor_present()
    end

    # 일정 수정은 생성자 또는 캘린더 소유자만 가능
    policy action_type(:update) do
      authorize_if expr(created_by_id == ^actor(:id))
      authorize_if expr(calendar.owner_id == ^actor(:id))
    end

    # 일정 삭제는 생성자 또는 캘린더 소유자만 가능
    policy action_type(:destroy) do
      authorize_if expr(created_by_id == ^actor(:id))
      authorize_if expr(calendar.owner_id == ^actor(:id))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :title, :string do
      allow_nil? false
      public? true
    end

    attribute :description, :string do
      public? true
    end

    attribute :start_time, :utc_datetime do
      allow_nil? false
      public? true
    end

    attribute :end_time, :utc_datetime do
      allow_nil? false
      public? true
    end

    attribute :all_day, :boolean do
      description "하루 종일 일정 여부"
      default false
      allow_nil? false
      public? true
    end

    attribute :location, :string do
      description "장소"
      public? true
    end

    attribute :calendar_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :recurrence_rule, :string do
      description "반복 규칙 (RRULE 형식, 예: FREQ=DAILY;INTERVAL=1)"
      public? true
    end

    attribute :status, :atom do
      description "일정 상태"
      constraints one_of: [:confirmed, :tentative, :cancelled]
      default :confirmed
      allow_nil? false
      public? true
    end

    attribute :created_by_id, :uuid do
      allow_nil? false
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :calendar, Gongu.Groups.Calendar do
      attribute_writable? true
    end

    belongs_to :created_by, Gongu.Accounts.User do
      attribute_writable? true
    end
  end
end
