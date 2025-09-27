defmodule Gongu.Groups do
  use Ash.Domain, otp_app: :gongu, extensions: [AshAdmin.Domain, AshTypescript.Rpc]

  admin do
    show? true
  end

  typescript_rpc do
    resource Gongu.Groups.Group do
      rpc_action :list_groups, :read
      rpc_action :create_group, :create
      rpc_action :get_group, :read
      rpc_action :update_group, :update
      rpc_action :delete_group, :destroy
    end

    resource Gongu.Groups.GroupMembership do
      rpc_action :list_memberships, :read
      rpc_action :join_group, :join_group
      rpc_action :invite_to_group, :invite_to_group
      rpc_action :accept_invitation, :accept_invitation
      rpc_action :update_member_role, :update_role
      rpc_action :leave_group, :destroy
    end
  end

  resources do
    resource Gongu.Groups.Group
    resource Gongu.Groups.GroupMembership
  end
end
