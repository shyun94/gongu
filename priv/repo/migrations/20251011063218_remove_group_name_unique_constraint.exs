defmodule Gongu.Repo.Migrations.RemoveGroupNameUniqueConstraint do
  use Ecto.Migration

  def up do
    # 그룹 이름의 유니크 제약조건 제거 (같은 생성자가 같은 이름의 그룹을 여러 개 만들 수 있도록)
    drop_if_exists unique_index(:groups, [:name, :creator_id],
                     name: "groups_unique_name_per_creator_index"
                   )
  end

  def down do
    # 롤백 시 유니크 제약조건 복원
    create unique_index(:groups, [:name, :creator_id],
             name: "groups_unique_name_per_creator_index"
           )
  end
end
