defmodule Gongu.Groups.Invitation do
  use Ash.Resource,
    otp_app: :gongu,
    domain: Gongu.Groups,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "invitations"
    repo Gongu.Repo
  end

  actions do
    defaults [:read, :update]

    create :create do
      description "새 초대 코드 생성"
      accept [:group_id]

      change set_attribute(:created_by_id, actor(:id))

      # 초대 코드 자동 생성
      change fn changeset, _context ->
        code = generate_invite_code()
        Ash.Changeset.change_attribute(changeset, :code, code)
      end

      # 만료 시간 설정 (7일 후)
      change fn changeset, _context ->
        expires_at = DateTime.utc_now() |> DateTime.add(7, :day)
        Ash.Changeset.change_attribute(changeset, :expires_at, expires_at)
      end
    end
  end

  policies do
    policy action_type(:create) do
      authorize_if actor_present()
    end

    policy action_type(:read) do
      authorize_if actor_present()
    end

    policy action_type(:update) do
      authorize_if actor_present()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :code, :string do
      description "초대 코드 (8자리 랜덤 문자열)"
      allow_nil? false
      public? true
    end

    attribute :created_by_id, :uuid do
      description "초대 코드를 생성한 사용자"
      allow_nil? false
      public? true
    end

    attribute :used_by_id, :uuid do
      description "초대한 사용자"
      public? true
    end

    attribute :status, :atom do
      description "초대 상태"
      constraints one_of: [:pending, :accepted, :expired]
      default :pending
      allow_nil? false
      public? true
    end

    attribute :expires_at, :utc_datetime_usec do
      description "만료 시간"
      allow_nil? false
      public? true
    end

    attribute :used_at, :utc_datetime_usec do
      description "사용된 시간"
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :group, Gongu.Groups.Group do
      allow_nil? false
      attribute_writable? true
      attribute_public? true
    end

    belongs_to :created_by, Gongu.Accounts.User do
      description "초대 코드를 생성한 사용자"
      attribute_writable? true
      attribute_public? true
    end

    belongs_to :used_by, Gongu.Accounts.User do
      description "초대를 사용한 사용자"
      attribute_writable? true
      attribute_public? true
    end
  end

  identities do
    identity :unique_code, [:code]
  end

  # 초대 코드 생성 함수
  defp generate_invite_code do
    # 8자리 랜덤 문자열 생성 (대문자와 숫자만 사용)
    # 헷갈리는 문자 제외 (I, O, 0, 1)
    characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

    1..8
    |> Enum.map(fn _ ->
      String.at(characters, :rand.uniform(String.length(characters)) - 1)
    end)
    |> Enum.join()
  end
end
