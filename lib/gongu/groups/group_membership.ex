defmodule Gongu.Groups.GroupMembership do
  use Ash.Resource,
    otp_app: :gongu,
    domain: Gongu.Groups,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "group_memberships"
    repo Gongu.Repo
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true
      accept [:user_id, :group_id, :role]
    end

    create :invite_to_group do
      description "그룹에 사용자를 초대"
      accept [:user_id, :group_id, :invited_by_id]
      change set_attribute(:role, :member)
      change set_attribute(:status, :pending)
    end

    create :join_with_invitation do
      description "초대 코드로 그룹에 가입"
      argument :invite_code, :string, allow_nil?: false

      change set_attribute(:user_id, actor(:id))
      change set_attribute(:status, :active)
      change set_attribute(:role, :member)

      # 초대 코드로 유효한 초대 찾기 및 중복 가입 방지
      change fn changeset, context ->
        require Ash.Query

        invite_code = Ash.Changeset.get_argument(changeset, :invite_code)
        user_id = Ash.Changeset.get_attribute(changeset, :user_id)

        # 유효한 초대 찾기 (만료되지 않고 pending 상태인 것만)
        case Gongu.Groups.Invitation
             |> Ash.Query.filter(expr(code == ^invite_code and status == :pending))
             |> Ash.read_one(action: :read, actor: context.actor) do
          {:ok, invitation} ->
            # 초대가 만료되었는지 확인
            if DateTime.compare(invitation.expires_at, DateTime.utc_now()) == :lt do
              Ash.Changeset.add_error(changeset,
                field: :invite_code,
                message: "만료된 초대 코드입니다"
              )
            else
              # 이미 해당 그룹에 가입되어 있는지 확인
              case Gongu.Groups.GroupMembership
                   |> Ash.Query.filter(
                     expr(user_id == ^user_id and group_id == ^invitation.group_id)
                   )
                   |> Ash.read_one(action: :read, actor: context.actor) do
                {:ok, nil} ->
                  # 가입되지 않았으면 그룹 ID 설정
                  Ash.Changeset.change_attribute(changeset, :group_id, invitation.group_id)

                {:ok, _existing_membership} ->
                  # 이미 가입되어 있으면 에러
                  Ash.Changeset.add_error(changeset,
                    field: :invite_code,
                    message: "이미 해당 그룹에 가입되어 있습니다"
                  )

                {:error, _error} ->
                  Ash.Changeset.add_error(changeset,
                    field: :invite_code,
                    message: "가입 상태 확인 중 오류가 발생했습니다"
                  )
              end
            end

          {:ok, nil} ->
            Ash.Changeset.add_error(changeset,
              field: :invite_code,
              message: "유효하지 않은 초대 코드입니다"
            )

          {:error, _error} ->
            Ash.Changeset.add_error(changeset,
              field: :invite_code,
              message: "초대 코드 확인 중 오류가 발생했습니다"
            )
        end
      end
    end

    update :update_role do
      description "멤버의 역할 변경"
      accept [:role]
    end
  end

  policies do
    # 멤버십 정보는 해당 그룹의 멤버만 볼 수 있음
    policy action_type(:read) do
      authorize_if expr(user_id == ^actor(:id))
      authorize_if expr(group.memberships.user_id == ^actor(:id))
    end

    # 그룹 가입은 인증된 사용자만 가능
    policy action_type(:create) do
      authorize_if actor_present()
    end

    # 초대 코드로 가입은 인증된 사용자만 가능
    policy action(:join_with_invitation) do
      authorize_if actor_present()
    end

    # 역할 변경은 그룹 관리자만 가능
    policy action(:update_role) do
      authorize_if expr(
                     group.memberships.role == :admin and group.memberships.user_id == ^actor(:id)
                   )
    end

    # 멤버십 삭제(탈퇴)는 본인이거나 그룹 관리자가 가능
    policy action_type(:destroy) do
      authorize_if expr(user_id == ^actor(:id))

      authorize_if expr(
                     group.memberships.role == :admin and group.memberships.user_id == ^actor(:id)
                   )
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :user_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :group_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :role, :atom do
      constraints one_of: [:admin, :member]
      default :member
      allow_nil? false
      public? true
    end

    attribute :status, :atom do
      constraints one_of: [:active, :pending, :inactive]
      default :active
      allow_nil? false
      public? true
    end

    attribute :invited_by_id, :uuid do
      description "누가 초대했는지 기록"
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :user, Gongu.Accounts.User do
      attribute_writable? true
    end

    belongs_to :group, Gongu.Groups.Group do
      attribute_writable? true
    end

    belongs_to :invited_by, Gongu.Accounts.User do
      description "초대한 사용자"
      attribute_writable? true
    end
  end

  identities do
    identity :unique_user_per_group, [:user_id, :group_id]
  end
end
