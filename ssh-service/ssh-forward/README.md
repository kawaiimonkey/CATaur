# SSH Tunnel User Setup

This directory contains a script to set up a restricted user for SSH tunneling on Ubuntu 24.

## Files

- `install.sh`: The installation script.
- `tunnel-user.pub`: The public key to be authorized.

## Usage

1.  Ensure `tunnel-user.pub` contains the correct public key (already populated).
2.  Run the installation script with root privileges:

    ```bash
    sudo chmod +x install.sh
    sudo ./install.sh
    ```

## What it does

1.  Creates a user `tunnel-user` with `/usr/sbin/nologin` shell.
2.  Configures SSH keys from `uploaduser.pub`.
3.  Creates `/etc/ssh/sshd_config.d/99-tunnel-user.conf` to enforce:
    - `AllowTcpForwarding yes`: Allows tunneling.
    - `X11Forwarding no`: Disables X11 forwarding.
    - `PermitTTY no`: Disables TTY allocation.
    - `ForceCommand /usr/sbin/nologin`: Prevents command execution.
4.  Restarts the SSH service.

## Testing

To test the tunnel (replace `SERVER_IP` with your server's IP):

```bash
ssh -N -L 8080:localhost:80 tunnel-user@SERVER_IP
```
