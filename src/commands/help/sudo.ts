export const help_sudo = `sudo - Execute command as root

Usage:
  sudo -l                           # List privileges
  sudo <command>                    # Run command as root
  sudo su                           # Open root shell

Examples:
  sudo -l                           # Check sudo permissions

Description:
  Executes a command with root privileges. Uses sudoers file and
  group membership (sudo/wheel) to determine permissions.`;
