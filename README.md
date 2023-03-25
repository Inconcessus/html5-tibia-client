# Forby HTML5 Open Tibia Client

# Example

Visit https://inconcessus.nl for an example server & client. The server software can be found [here](https://github.com/Inconcessus/html5-tibia-engine).

# Deploying

The files in this repository need to be exposed through a webserver. An example python script is included that will host the current static directory on `127.0.0.1:8000`. It can be launched:

    python client-server.py

Then visit `127.0.0.1:8000` in your browser to visit the client. Note that the default protocol is HTTP.

# Options

Before connecting to the login server & game server please check under options that the login server address is set properly. For the default login server configuration, this field should be set to `127.0.0.1:1337`.

# Assets

Assets for `7.4` are automatically loaded from the `data` directory. Other assets can be imported by clicking the `Load Assets` button and selecting the respective `Tibia.spr` and `Tibia.dat` from disk. After first selection these files are cached locally using the IndexedDB API.

# Creating an Account

An account can be created by clicking `Create Account`, giving an account number, password, character name, and sex. This will be communicated with the login server to create your account.

# Connecting

After creating an account, the credentials can be used to connect to the login and game server.