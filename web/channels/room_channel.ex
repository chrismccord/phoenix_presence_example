defmodule PresenceChat.RoomChannel do
  use PresenceChat.Web, :channel
  alias PresenceChat.Presence

  def join("rooms:lobby", _, socket) do
    send self, :after_join
    {:ok, socket}
  end

  def handle_info(:update_meta, socket) do
    user_id = socket.assigns.user_id
    online_at = inspect(:os.timestamp())
    Presence.update(socket, user_id, %{online_at: online_at})
    Process.send_after(self, :update_meta, 5000)
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    user_id = socket.assigns.user_id
    online_at = inspect(:os.timestamp())

    Presence.track(socket, user_id, %{online_at: online_at})

    push socket, "presences", Presence.list(socket)
    Process.send_after(self, :update_meta, 5000)
    {:noreply, socket}
  end
end
