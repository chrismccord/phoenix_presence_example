defmodule PresenceChat.RoomChannel do
  use PresenceChat.Web, :channel
  import PresenceChat.Presence, only: [track_presence: 3, list: 1]

  def join("rooms:lobby", _, socket) do
    send self, :after_join
    {:ok, socket}
  end

  def handle_info(:update_meta, socket) do
    user_id = socket.assigns.user_id
    online_at = inspect(:os.timestamp())
    Phoenix.Tracker.update(PresenceChat.Presence, self(), socket.topic, user_id, %{online_at: online_at})
    Process.send_after(self, :update_meta, 5000)

    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    user_id = socket.assigns.user_id
    online_at = inspect(:os.timestamp())

    :ok = track_presence(socket, user_id, %{online_at: online_at})

    push socket, "presences", list(socket.topic)
    Process.send_after(self, :update_meta, 5000)
    {:noreply, socket}
  end
end
