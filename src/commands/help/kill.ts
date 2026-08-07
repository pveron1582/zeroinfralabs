export const help_kill = `kill - Terminate processes

Usage:
  kill [-s SIGNAL] PID...
  kill -9 PID
  kill -l

Examples:
  kill 1234                          # Send SIGTERM to process 1234
  kill -9 100                        # Force kill (SIGKILL)
  kill -l                            # List available signals

Description:
  Sends a signal to a process. Only the process owner or root can
  kill a process. SIGKILL (-9) cannot be ignored by the process.`;
