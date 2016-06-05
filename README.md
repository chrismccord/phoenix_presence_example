# PresenceChat

    mix deps.get
    npm install

Terminal session 1:

    PORT=4001 iex --name n1@127.0.0.1 --erl "-config sys.config" -S mix phoenix.server

Terminal session 2:

    PORT=4002 iex --name n2@127.0.0.1 --erl "-config sys.config" -S mix phoenix.server

Browser window 1:

    http://127.0.0.1:4001/?name=foo
    
Browser window 2:

    http://127.0.0.1:4002/?name=bar
