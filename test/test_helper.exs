ExUnit.start

Mix.Task.run "ecto.create", ~w(-r PresenceChat.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r PresenceChat.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(PresenceChat.Repo)

