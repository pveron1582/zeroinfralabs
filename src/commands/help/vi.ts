export const help_vi = `vi / vim - File editor (emulated)

Usage:
  vi FILE
  vim FILE

Description:
  In this simulator, vi/vim open the built-in file editor
  (same as nano). Modal editing (normal/insert visual) is not
  implemented.

Editor shortcuts (once open):
  Ctrl+O  Write file (save)
  Ctrl+X  Exit

Tip for training: sudo vim /etc/passwd and vim -c "!bash"
are handled as privilege-escalation flows.`;
