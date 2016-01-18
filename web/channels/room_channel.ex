defmodule PresenceChat.RoomChannel do
  use PresenceChat.Web, :channel
  alias Phoenix.Presence.Tracker

  def join("rooms:lobby", _, socket) do
    send self, :after_join
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    user_id = socket.assigns.user_id
    online_at = inspect(:os.timestamp())

    Tracker.track(socket, user_id, %{online_at: online_at})

    push socket, "users_list", %{users: Tracker.list_by(socket)}
    {:noreply, socket}
  end
end
