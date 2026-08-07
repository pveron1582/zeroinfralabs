export const help_hydra = `hydra - Network login cracker

Usage:
  hydra -l <user> -P <wordlist> <protocol>://<target>

Examples:
  hydra -l admin -P /usr/share/wordlists/rockyou.txt ftp://192.168.1.10
  hydra -L users.txt -P passwords.txt ssh://10.0.0.5

Description:
  Performs brute force attacks against network services (SSH, FTP, HTTP, etc.).`;
