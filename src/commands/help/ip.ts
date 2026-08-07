export const help_ip = `ip - Show/manipulate network interfaces and routing

Usage:
  ip addr                            # Show IP addresses
  ip link                            # Show interfaces
  ip link set eth0 up|down           # Bring interface up/down
  ip route                           # Show routing table

Examples:
  ip addr
  ip link set eth0 down
  ip route

Description:
  Displays interface addresses, link state and routes. Bringing an
  interface down removes connectivity to that interface.`;
