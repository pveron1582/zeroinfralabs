export const help_journalctl = `journalctl - Query system logs

Usage:
  journalctl [-u <service>] [-n <lines>] [-f]

Options:
  -u <service>  Show logs for a specific service
  -n <lines>    Show only the last N lines
  -f            Follow mode (stream new log entries)

Examples:
  journalctl                         # Show recent system logs
  journalctl -u ssh                  # Show SSH service logs
  journalctl -u nginx -n 30          # Last 30 nginx log lines
  journalctl -f                      # Follow mode

Description:
  Reads log entries from /var/log. With -f it runs as a blocking
  command until you press 'q'.`;
