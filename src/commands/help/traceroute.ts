export const help_traceroute = `traceroute - Trace route to a host

Usage:
  traceroute [options] <host>

Options:
  -m <max_ttl>  Set max number of hops (default: 30)
  -q <nqueries> Set probes per hop (default: 3)
  -w <waittime> Time to wait for response in seconds (default: 5)

Examples:
  traceroute 192.168.1.10            # Trace route to host
  traceroute -m 20 8.8.8.8            # Max 20 hops

Description:
  Displays the network path/route taken to reach a destination,
  showing each intermediate hop with response times.`;
