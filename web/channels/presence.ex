defmodule PresenceChat.Presence do
  use Phoenix.Presence, otp_app: :presence_chat

  def fetch(_topic, entries) do
    for {key, %{metas: metas}} <- entries, into: %{} do
      {key, %{metas: metas, user: %{name: "chris"}}}
    end
  end
end
