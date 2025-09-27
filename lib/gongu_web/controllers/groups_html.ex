defmodule GonguWeb.GroupsHTML do
  @moduledoc """
  This module contains pages rendered by GroupsController.

  See the `groups_html` directory for all templates.
  """
  use GonguWeb, :html

  embed_templates "groups_html/*"
end
