defmodule Gongu.Groups.Calendar do
  use Ash.Resource,
    otp_app: :gongu,
    domain: Gongu.Groups,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "calendars"
    repo Gongu.Repo
  end

  actions do
    defaults [:read, :destroy]

    read :get_calendar do
      get? true

      argument :id, :uuid do
        allow_nil? false
      end

      filter expr(id == ^arg(:id))
    end

    create :create do
      accept [:name, :description, :color, :timezone, :visibility, :group_id]

      change set_attribute(:owner_id, actor(:id))
    end

    update :update do
      accept [:name, :description, :color, :timezone, :visibility]
    end
  end

  policies do
    # 캘린더 읽기는 소유자 또는 그룹 멤버만 가능
    policy action_type(:read) do
      authorize_if expr(owner_id == ^actor(:id))
      authorize_if expr(group.memberships.user_id == ^actor(:id))
    end

    # 캘린더 생성은 인증된 사용자만 가능
    policy action_type(:create) do
      authorize_if actor_present()
    end

    # 캘린더 수정은 소유자만 가능
    policy action_type(:update) do
      authorize_if expr(owner_id == ^actor(:id))
    end

    # 캘린더 삭제는 소유자만 가능
    policy action_type(:destroy) do
      authorize_if expr(owner_id == ^actor(:id))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :name, :string do
      allow_nil? false
      public? true
    end

    attribute :description, :string do
      public? true
    end

    attribute :color, :string do
      description "캘린더 색상 (hex 코드, 예: #4285f4)"
      default "#4285f4"
      public? true
    end

    attribute :timezone, :string do
      description "시간대 (예: Asia/Seoul)"
      default "Asia/Seoul"
      public? true
    end

    attribute :visibility, :atom do
      description "공개 여부"
      constraints one_of: [:public, :private]
      default :private
      allow_nil? false
      public? true
    end

    attribute :owner_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :group_id, :uuid do
      description "그룹에 속한 캘린더인 경우 그룹 ID (선택적)"
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :owner, Gongu.Accounts.User do
      attribute_writable? true
    end

    belongs_to :group, Gongu.Groups.Group do
      attribute_writable? true
    end

    has_many :events, Gongu.Groups.Event do
      destination_attribute :calendar_id
    end
  end

  identities do
    identity :unique_name_per_owner, [:name, :owner_id]
  end
end
