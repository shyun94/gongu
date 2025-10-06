defmodule Gongu.Groups.Group do
  use Ash.Resource,
    otp_app: :gongu,
    domain: Gongu.Groups,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "groups"
    repo Gongu.Repo
  end

  actions do
    defaults [:read, :destroy]

    read :get_group do
      get? true
      argument :id, :uuid, allow_nil?: false
      filter expr(id == ^arg(:id))
    end

    create :create do
      accept [:name, :description]

      change set_attribute(:creator_id, actor(:id))

      # 그룹을 생성하면 생성자를 자동으로 관리자로 추가
      change after_action(fn changeset, group, context ->
               creator_id = group.creator_id

               case Ash.create(
                      Gongu.Groups.GroupMembership,
                      %{
                        user_id: creator_id,
                        group_id: group.id,
                        role: :admin
                      },
                      actor: context.actor
                    ) do
                 {:ok, _membership} -> {:ok, group}
                 {:error, error} -> {:error, error}
               end
             end)
    end

    update :update do
      accept [:name, :description]
    end
  end

  policies do
    # 인증된 사용자만 그룹을 읽을 수 있음
    policy action_type(:read) do
      authorize_if actor_present()
    end

    # 그룹 생성은 인증된 사용자만 가능
    policy action_type(:create) do
      authorize_if actor_present()
    end

    # 그룹 수정은 해당 그룹의 관리자만 가능
    policy action_type(:update) do
      authorize_if relates_to_actor_via([:memberships, :user])
      authorize_if expr(memberships.role == :admin and memberships.user_id == ^actor(:id))
    end

    # 그룹 삭제는 해당 그룹의 관리자만 가능
    policy action_type(:destroy) do
      authorize_if relates_to_actor_via([:memberships, :user])
      authorize_if expr(memberships.role == :admin and memberships.user_id == ^actor(:id))
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

    attribute :creator_id, :uuid do
      allow_nil? false
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :creator, Gongu.Accounts.User do
      attribute_writable? true
    end

    has_many :memberships, Gongu.Groups.GroupMembership do
      destination_attribute :group_id
    end

    many_to_many :members, Gongu.Accounts.User do
      through Gongu.Groups.GroupMembership
      source_attribute_on_join_resource :group_id
      destination_attribute_on_join_resource :user_id
    end
  end

  identities do
    identity :unique_name_per_creator, [:name, :creator_id]
  end
end
