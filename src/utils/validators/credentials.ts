// ── utils/validators/credentials.ts ──────────────────────────────
// Validadores de credenciales y logins: creds encontradas, SSH y FTP.

import type { CommandResponse, ValidationCriteria } from '../../types';

export function validateFoundCredentials(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const foundCredentials = 'foundCredentials' in result ? result.foundCredentials : undefined;
  if (!foundCredentials) return false;

  // Check verified
  if (conditions.verified !== undefined) {
    if (foundCredentials.verified !== conditions.verified) {
      return false;
    }
  }

  // Check user
  if (conditions.user && foundCredentials.user !== conditions.user) {
    return false;
  }

  // Check service
  if (conditions.service && foundCredentials.service !== conditions.service) {
    return false;
  }

  return true;
}

export function validateSshLogin(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const sshLoginUser = 'sshLoginUser' in result ? result.sshLoginUser : undefined;
  if (!sshLoginUser) return false;

  if (conditions.user && sshLoginUser !== conditions.user) {
    return false;
  }

  return true;
}

export function validateFtpLogin(
  result: CommandResponse,
  _conditions: Partial<ValidationCriteria>
): boolean {
  const ftpSession = 'ftpSession' in result ? result.ftpSession : undefined;
  if (!ftpSession) return false;

  return ftpSession.connected === true && ftpSession.loggedIn === true;
}
