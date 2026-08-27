// ── utils/labValidator.ts ─────────────────────────────────────────
// Universal validator for all labs.
// Commands are free - this validates if a command result completes a mission.
// Dispatcher: cada familia de validadores vive en utils/validators/*.

import type { CommandResponse, Mission } from '../types';
import { validateDiscoveredHosts, validateScanResults, validateFoundDirectories } from './validators/discovery';
import { validateFoundCredentials, validateSshLogin, validateFtpLogin } from './validators/credentials';
import { validateFileRead, validateFileDownloaded } from './validators/filesystem';
import {
  validatePrivesc, validateVulnerability, validateExploit, validateUidChecked,
  validateNcListener, validateBlockingCommand, validateSudoPrivileges,
} from './validators/exploit';
import { validateHttpRequest, validateBrowserAction } from './validators/network';

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
      return validateFileRead(mission, result, conditions);

    case 'fileDownloaded':
      return validateFileDownloaded(mission, result, conditions);

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

    case 'httpRequest':
      return validateHttpRequest(result, conditions);

    case 'browserAction':
      return validateBrowserAction(result, mission, conditions);

    default:
      return false;
  }
};
