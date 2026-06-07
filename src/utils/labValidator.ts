// ── utils/labValidator.ts ─────────────────────────────────────────
// Universal validator for all labs
// Commands are free - this validates if a command result completes a mission

import type { CommandResponse, Mission, ValidationCriteria, MissionCriteriaType } from '../types';

/**
 * Validates if a command result satisfies a mission's criteria
 * @param result - The command response with metadata
 * @param mission - The mission to validate against
 * @returns true if mission should be completed
 */
export const validateMission = (result: CommandResponse, mission: Mission): boolean => {
  if (!mission.validationCriteria) {
    // No validation criteria defined - mission cannot be auto-completed
    return false;
  }

  const { type, ...conditions } = mission.validationCriteria;

  switch (type) {
    case 'discoveredHosts':
      return validateDiscoveredHosts(result, conditions);

    case 'scanResults':
      return validateScanResults(result, conditions);

    case 'foundCredentials':
      return validateFoundCredentials(result, conditions);

    case 'foundDirectories':
      return validateFoundDirectories(result, conditions);

    case 'fileRead':
      return validateFileRead(result, conditions);

    case 'fileDownloaded':
      return validateFileDownloaded(result, conditions);

    case 'privesc':
      return validatePrivesc(result, conditions);

    case 'sshLogin':
      return validateSshLogin(result, conditions);

    case 'ftpLogin':
      return validateFtpLogin(result, conditions);

    case 'vulnerabilityFound':
      return validateVulnerability(result, conditions);

    case 'exploit':
      return validateExploit(result, conditions);

    case 'uidChecked':
      return validateUidChecked(result, conditions);

    case 'ncListener':
      return validateNcListener(result, conditions);

    case 'blockingCommand':
      return validateBlockingCommand(result, conditions);

    case 'sudoPrivileges':
      return validateSudoPrivileges(result, conditions);

    case 'custom':
      // Custom validation handled elsewhere or via conditions
      return false;

    default:
      return false;
  }
};

// ── Individual Validators ─────────────────────────────────────────

function validateDiscoveredHosts(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.discoveredHosts || result.discoveredHosts.length === 0) {
    return false;
  }

  const minHosts = conditions.minHosts ?? 1;
  if (result.discoveredHosts.length < minHosts) {
    return false;
  }

  // Check target IP if specified
  if (conditions.targetIp) {
    return result.discoveredHosts.some(h => h.ip === conditions.targetIp);
  }

  return true;
}

function validateScanResults(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.scanResults) return false;

  // Check specific port
  if (conditions.port) {
    return result.scanResults.ports.some(p => p.port === conditions.port);
  }

  // Check target IP
  if (conditions.targetIp) {
    return result.scanResults.targetIp === conditions.targetIp;
  }

  // Any scan results count
  return result.scanResults.ports.length > 0;
}

function validateFoundCredentials(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.foundCredentials) return false;

  // Check verified
  if (conditions.verified !== undefined) {
    if (result.foundCredentials.verified !== conditions.verified) {
      return false;
    }
  }

  // Check user
  if (conditions.user && result.foundCredentials.user !== conditions.user) {
    return false;
  }

  return true;
}

function validateFoundDirectories(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.foundDirectories) return false;

  // Check specific directories found
  if (conditions.directories && conditions.directories.length > 0) {
    return conditions.directories.every(dir =>
      result.foundDirectories!.directories.some(d => d.path === dir || d.path.includes(dir))
    );
  }

  // Any directories count
  return result.foundDirectories.directories.length > 0;
}

function validateFileRead(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.fileRead) return false;

  const fileType = conditions.fileType ?? 'any';

  switch (fileType) {
    case 'flag':
      return result.fileRead.isFlag === true;
    case 'payload':
      return result.fileRead.isPayload === true;
    case 'note':
      return result.fileRead.isNote === true;
    case 'any':
    default:
      return true;
  }
}

function validateFileDownloaded(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.downloadedFile) return false;

  const fileType = conditions.fileType ?? 'any';

  if (fileType === 'note') {
    const filename = result.downloadedFile.path.toLowerCase();
    return filename.includes('note') || filename.includes('nota');
  }

  if (fileType === 'flag') {
    const filename = result.downloadedFile.path.toLowerCase();
    return filename.includes('flag');
  }

  return true;
}

function validatePrivesc(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  return result.privescAttempted === true;
}

function validateSshLogin(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.sshLoginUser) return false;

  if (conditions.user && result.sshLoginUser !== conditions.user) {
    return false;
  }

  return true;
}

function validateFtpLogin(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.ftpSession) return false;

  return result.ftpSession.connected === true && result.ftpSession.loggedIn === true;
}

function validateVulnerability(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.foundVulnerability) return false;

  if (conditions.vulnId) {
    return result.foundVulnerability.vulnId === conditions.vulnId;
  }

  return result.foundVulnerability.status === 'confirmed';
}

function validateExploit(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  // Exploit is considered successful if newMachineId is set (session opened)
  // or if privesc is detected
  return !!result.newMachineId || result.privescAttempted === true;
}

function validateUidChecked(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.uidChecked) return false;

  if (conditions.isSystem !== undefined) {
    return result.isSystem === conditions.isSystem;
  }

  return true;
}

function validateNcListener(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.blockingCommand) return false;

  if (conditions.port) {
    return result.blockingCommand.listeningPort === conditions.port;
  }

  return result.blockingCommand.listeningPort !== undefined;
}

function validateBlockingCommand(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  return !!result.blockingCommand;
}

function validateSudoPrivileges(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  if (!result.sudoPrivileges || !result.sudoPrivileges.canSudo) {
    return false;
  }

  if (conditions.user && result.sudoPrivileges.user !== conditions.user) {
    return false;
  }

  // Optional: require at least one allowed command matching `conditions.command`
  // (substring match against each sudoers rule, so "vim" matches "/usr/bin/vim").
  if (conditions.command) {
    const needle = conditions.command.toLowerCase();
    return result.sudoPrivileges.commands.some(rule => rule.toLowerCase().includes(needle));
  }

  return true;
}
