// ── utils/labValidator.ts ─────────────────────────────────────────
// Universal validator for all labs
// Commands are free - this validates if a command result completes a mission

import type { CommandResponse, Mission, ValidationCriteria } from '../types';

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

    case 'browserAction':
      return validateBrowserAction(result, conditions);

    default:
      return false;
  }
};

// ── Individual Validators ─────────────────────────────────────────

function validateDiscoveredHosts(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const hosts = 'discoveredHosts' in result ? result.discoveredHosts : undefined;
  if (!hosts || hosts.length === 0) {
    return false;
  }

  const minHosts = conditions.minHosts ?? 1;
  if (hosts.length < minHosts) {
    return false;
  }

  // Check target IP if specified
  if (conditions.targetIp) {
    return hosts.some(h => h.ip === conditions.targetIp);
  }

  return true;
}

function validateScanResults(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const scanResults = 'scanResults' in result ? result.scanResults : undefined;
  if (!scanResults) return false;

  // Check specific port
  if (conditions.port) {
    return scanResults.ports.some(p => p.port === conditions.port);
  }

  // Check target IP
  if (conditions.targetIp) {
    return scanResults.targetIp === conditions.targetIp;
  }

  // Any scan results count
  return scanResults.ports.length > 0;
}

function validateFoundCredentials(
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

function validateFoundDirectories(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const foundDirectories = 'foundDirectories' in result ? result.foundDirectories : undefined;
  if (!foundDirectories) return false;

  // Check specific directories found
  if (conditions.directories && conditions.directories.length > 0) {
    return conditions.directories.every(dir =>
      foundDirectories.directories.some(d => d.path === dir || d.path.includes(dir))
    );
  }

  // Any directories count
  return foundDirectories.directories.length > 0;
}

function validateFileRead(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const fileRead = 'fileRead' in result ? result.fileRead : undefined;
  if (!fileRead) return false;

  const fileType = conditions.fileType ?? 'any';

  switch (fileType) {
    case 'flag':
      return fileRead.isFlag === true;
    case 'payload':
      return fileRead.isPayload === true;
    case 'note':
      return fileRead.isNote === true;
    case 'any':
    default:
      return true;
  }
}

function validateFileDownloaded(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const downloadedFile = 'downloadedFile' in result ? result.downloadedFile : undefined;
  if (!downloadedFile) return false;

  const fileType = conditions.fileType ?? 'any';

  if (fileType === 'note') {
    const filename = downloadedFile.path.toLowerCase();
    return filename.includes('note') || filename.includes('nota');
  }

  if (fileType === 'flag') {
    const filename = downloadedFile.path.toLowerCase();
    return filename.includes('flag');
  }

  return true;
}

function validatePrivesc(
  result: CommandResponse,
  _conditions: Partial<ValidationCriteria>
): boolean {
  return 'privescAttempted' in result && result.privescAttempted === true;
}

function validateSshLogin(
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

function validateFtpLogin(
  result: CommandResponse,
  _conditions: Partial<ValidationCriteria>
): boolean {
  const ftpSession = 'ftpSession' in result ? result.ftpSession : undefined;
  if (!ftpSession) return false;

  return ftpSession.connected === true && ftpSession.loggedIn === true;
}

function validateVulnerability(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const foundVulnerability = 'foundVulnerability' in result ? result.foundVulnerability : undefined;
  if (!foundVulnerability) return false;

  if (conditions.vulnId) {
    return foundVulnerability.vulnId === conditions.vulnId &&
      (conditions.status ? foundVulnerability.status === conditions.status : true);
  }

  return foundVulnerability.status === 'confirmed';
}

function validateExploit(
  result: CommandResponse,
  _conditions: Partial<ValidationCriteria>
): boolean {
  // Exploit is considered successful if newMachineId is set (session opened)
  // or if privesc is detected
  const newMachineId = 'newMachineId' in result ? result.newMachineId : undefined;
  const privescAttempted = 'privescAttempted' in result ? result.privescAttempted : undefined;
  return !!newMachineId || privescAttempted === true;
}

function validateUidChecked(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const uidChecked = 'uidChecked' in result ? result.uidChecked : undefined;
  if (!uidChecked) return false;

  if (conditions.isSystem !== undefined) {
    const isSystem = 'isSystem' in result ? result.isSystem : undefined;
    return isSystem === conditions.isSystem;
  }

  return true;
}

function validateNcListener(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const blockingCommand = 'blockingCommand' in result ? result.blockingCommand : undefined;
  if (!blockingCommand) return false;

  if (conditions.port) {
    return blockingCommand.listeningPort === conditions.port;
  }

  return blockingCommand.listeningPort !== undefined;
}

function validateBlockingCommand(
  result: CommandResponse,
  _conditions: Partial<ValidationCriteria>
): boolean {
  return 'blockingCommand' in result && !!result.blockingCommand;
}

function validateSudoPrivileges(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const sudoPrivileges = 'sudoPrivileges' in result ? result.sudoPrivileges : undefined;
  if (!sudoPrivileges || !sudoPrivileges.canSudo) {
    return false;
  }

  if (conditions.user && sudoPrivileges.user !== conditions.user) {
    return false;
  }

  // Optional: require at least one allowed command matching `conditions.command`
  // (substring match against each sudoers rule, so "vim" matches "/usr/bin/vim").
  if (conditions.command) {
    const needle = conditions.command.toLowerCase();
    return sudoPrivileges.commands.some(rule => rule.toLowerCase().includes(needle));
  }

  return true;
}

// ── Browser Action Validator ─────────────────────────────────────
// Validación de acciones del navegador simulado (FakeBrowser).
// El componente FakeBrowser llama a onMissionComplete directamente cuando
// detecta la acción, pero también puede emitir metadata para validación
// centralizada si en el futuro se integra con el sistema de comandos.

function validateBrowserAction(
  _result: CommandResponse,
  _conditions: Partial<ValidationCriteria>
): boolean {
  // browserAction se valida directamente en FakeBrowser.tsx via onMissionComplete.
  // Esta función existe para completar el union type; la validación real ocurre
  // en el componente cuando el usuario navega a la URL objetivo.
  return false;
}
