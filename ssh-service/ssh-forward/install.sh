#!/bin/bash

# Configuration
USERNAME="tunnel-user"
PUBKEY_FILE="tunnel-user.pub"
SSHD_CONFIG_FILE="/etc/ssh/sshd_config.d/99-tunnel-user.conf"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Check if public key file exists
if [ ! -f "$PUBKEY_FILE" ]; then
    echo "Error: Public key file '$PUBKEY_FILE' not found."
    exit 1
fi

# Create user if not exists
if id "$USERNAME" &>/dev/null; then
    echo "User '$USERNAME' already exists."
else
    # Create user with restricted shell but allowing execution of ForceCommand
    # We use /bin/bash (or /bin/sh) so sshd can execute the ForceCommand.
    useradd -m -s /bin/bash "$USERNAME"
    echo "User '$USERNAME' created."
fi

# Setup SSH key
USER_SSH_DIR="/home/$USERNAME/.ssh"
mkdir -p "$USER_SSH_DIR"

cat "$PUBKEY_FILE" > "$USER_SSH_DIR/authorized_keys"

chmod 700 "$USER_SSH_DIR"
chmod 600 "$USER_SSH_DIR/authorized_keys"
chown -R "$USERNAME:$USERNAME" "$USER_SSH_DIR"

echo "SSH key configured for '$USERNAME'."

# Configure SSHD restrictions
echo "Configuring SSHD restrictions..."

# Note: We use ForceCommand to prevent interactive shell or command execution,
# but we sleep infinity to keep the connection open for tunneling.
cat > "$SSHD_CONFIG_FILE" <<EOF
Match User $USERNAME
    AllowTcpForwarding yes
    X11Forwarding no
    PermitTTY no
    GatewayPorts yes
    ForceCommand echo 'This account is restricted to SSH tunneling only.' && sleep infinity
EOF

# Restart SSH service
if systemctl restart ssh; then
    echo "SSH service restarted."
else
    echo "Warning: Failed to restart SSH service. Please check configuration."
fi

echo "Setup complete. User '$USERNAME' is ready for SSH tunneling."
