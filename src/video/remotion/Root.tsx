// ── video/remotion/Root.tsx ─────────────────────────────────────────
// Root de Remotion: registra todas las composiciones.
// durationInFrames se calcula a partir de los audios reales + gap.

import React from 'react';
import { Composition } from 'remotion';
import { Pe01PentestPhases } from './compositions/Pe01PentestPhases';
import { Pe02Filesystem } from './compositions/Pe02Filesystem';
import { Ci03InformationGathering } from './compositions/Ci03InformationGathering';
import { Ci04Cryptography } from './compositions/Ci04Cryptography';
import { Ci05OwaspTopTen } from './compositions/Ci05OwaspTopTen';
import { Li01LinuxHistory } from './compositions/Li01LinuxHistory';
import { Li02ShellAnatomy } from './compositions/Li02ShellAnatomy';
import { Li03CoreCommands } from './compositions/Li03CoreCommands';
import { Li04CreateEdit } from './compositions/Li04CreateEdit';
import { Li05Permissions } from './compositions/Li05Permissions';
import { Wi01WindowsHistory } from './compositions/Wi01WindowsHistory';
import { Wi02CurrentVersions } from './compositions/Wi02CurrentVersions';
import { Wi03Security } from './compositions/Wi03Security';
import { Wi04Filesystem } from './compositions/Wi04Filesystem';
import { Wi05NetworkServices } from './compositions/Wi05NetworkServices';
import { Ci01CiaTriad } from './compositions/Ci01CiaTriad';
import { Ci02HashesCracking } from './compositions/Ci02HashesCracking';
import { Ot01AlternativeSystems } from './compositions/Ot01AlternativeSystems';
import { Ot02PortableDevices } from './compositions/Ot02PortableDevices';
import { Ot03HackingHardware } from './compositions/Ot03HackingHardware';
import { Ot04SocialEngineering } from './compositions/Ot04SocialEngineering';
import { Re1ProtocolsByLayer } from './compositions/Re1ProtocolsByLayer';
import { Re1Ports } from './compositions/Re1Ports';
import { Re1Services } from './compositions/Re1Services';
import { Re1Devices } from './compositions/Re1Devices';
import { Re1Vlans } from './compositions/Re1Vlans';
import { Re01NetworkTypes } from './compositions/Re01NetworkTypes';
import { Re2Dhcp } from './compositions/Re2Dhcp';
import { Re2Nat } from './compositions/Re2Nat';
import { Re2Dns } from './compositions/Re2Dns';
import { Re2Vpn } from './compositions/Re2Vpn';
import { Re2Dmz } from './compositions/Re2Dmz';
import { Re02IpAddresses } from './compositions/Re02IpAddresses';
import { Re03DevicesTopologies } from './compositions/Re03DevicesTopologies';
import { Re04OsiLayers } from './compositions/Re04OsiLayers';
import { Re05AddressingDns } from './compositions/Re05AddressingDns';
import { Pe03OfflineCracking } from './compositions/Pe03OfflineCracking';
import { Pe04OnlineCracking } from './compositions/Pe04OnlineCracking';
import { Pe05ManInTheMiddle } from './compositions/Pe05ManInTheMiddle';
import { Hw01WebProtocols } from './compositions/Hw01WebProtocols';
import { Hw02DomainsSubdirectories } from './compositions/Hw02DomainsSubdirectories';
import { Hw03Xss } from './compositions/Hw03Xss';
import { Hw04SqlInjection } from './compositions/Hw04SqlInjection';
import { Hw05PathTraversalLfi } from './compositions/Hw05PathTraversalLfi';
import { Sl01BashIntro } from './compositions/Sl01BashIntro';
import { Sl02VariablesConditionals } from './compositions/Sl02VariablesConditionals';
import { Sl03LoopsFunctions } from './compositions/Sl03LoopsFunctions';
import { Sl04Enumeration } from './compositions/Sl04Enumeration';
import { Sl05ReverseShells } from './compositions/Sl05ReverseShells';
import { Ps01ObjectsPipeline } from './compositions/Ps01ObjectsPipeline';
import { Ps02VariablesConditions } from './compositions/Ps02VariablesConditions';
import { Ps03LoopsCmdlets } from './compositions/Ps03LoopsCmdlets';
import { Ps04WindowsEnumeration } from './compositions/Ps04WindowsEnumeration';
import { Ps05CredentialsObfuscation } from './compositions/Ps05CredentialsObfuscation';
import { Py01PythonIntro } from './compositions/Py01PythonIntro';
import { Py02TypesConditions } from './compositions/Py02TypesConditions';
import { Py03LoopsLibraries } from './compositions/Py03LoopsLibraries';
import { Py04SocketNetworking } from './compositions/Py04SocketNetworking';
import { Py05HttpRequests } from './compositions/Py05HttpRequests';








import { totalDurationFrames } from './audioTimings';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="pe-01-pentest-phases"
        component={() => <Pe01PentestPhases lang="es" />}
        durationInFrames={totalDurationFrames('pe-01-pentest-phases', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-01-pentest-phases-en"
        component={() => <Pe01PentestPhases lang="en" />}
        durationInFrames={totalDurationFrames('pe-01-pentest-phases', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-02-filesystem"
        component={() => <Pe02Filesystem lang="es" />}
        durationInFrames={totalDurationFrames('pe-02-filesystem', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-02-filesystem-en"
        component={() => <Pe02Filesystem lang="en" />}
        durationInFrames={totalDurationFrames('pe-02-filesystem', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-03-information-gathering"
        component={() => <Ci03InformationGathering lang="es" />}
        durationInFrames={totalDurationFrames('ci-03-information-gathering', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-03-information-gathering-en"
        component={() => <Ci03InformationGathering lang="en" />}
        durationInFrames={totalDurationFrames('ci-03-information-gathering', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-04-cryptography"
        component={() => <Ci04Cryptography lang="es" />}
        durationInFrames={totalDurationFrames('ci-04-cryptography', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-04-cryptography-en"
        component={() => <Ci04Cryptography lang="en" />}
        durationInFrames={totalDurationFrames('ci-04-cryptography', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-05-owasp-top-ten"
        component={() => <Ci05OwaspTopTen lang="es" />}
        durationInFrames={totalDurationFrames('ci-05-owasp-top-ten', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-05-owasp-top-ten-en"
        component={() => <Ci05OwaspTopTen lang="en" />}
        durationInFrames={totalDurationFrames('ci-05-owasp-top-ten', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-01-linux-history"
        component={Li01LinuxHistory}
        durationInFrames={totalDurationFrames('li-01-linux-history', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-02-shell-anatomy"
        component={() => <Li02ShellAnatomy lang="es" />}
        durationInFrames={totalDurationFrames('li-02-shell', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-03-core-commands"
        component={() => <Li03CoreCommands lang="es" />}
        durationInFrames={totalDurationFrames('li-03-commands', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-04-create-edit"
        component={() => <Li04CreateEdit lang="es" />}
        durationInFrames={totalDurationFrames('li-04-create-edit', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-05-permissions"
        component={() => <Li05Permissions lang="es" />}
        durationInFrames={totalDurationFrames('li-05-permissions', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-05-permissions-en"
        component={() => <Li05Permissions lang="en" />}
        durationInFrames={totalDurationFrames('li-05-permissions', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-01-windows-history"
        component={() => <Wi01WindowsHistory lang="es" />}
        durationInFrames={totalDurationFrames('wi-01-windows-history', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-01-windows-history-en"
        component={() => <Wi01WindowsHistory lang="en" />}
        durationInFrames={totalDurationFrames('wi-01-windows-history', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-02-current-versions"
        component={() => <Wi02CurrentVersions lang="es" />}
        durationInFrames={totalDurationFrames('wi-02-current-versions', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-02-current-versions-en"
        component={() => <Wi02CurrentVersions lang="en" />}
        durationInFrames={totalDurationFrames('wi-02-current-versions', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-03-security"
        component={() => <Wi03Security lang="es" />}
        durationInFrames={totalDurationFrames('wi-03-security', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-03-security-en"
        component={() => <Wi03Security lang="en" />}
        durationInFrames={totalDurationFrames('wi-03-security', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-04-filesystem"
        component={() => <Wi04Filesystem lang="es" />}
        durationInFrames={totalDurationFrames('wi-04-filesystem', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-04-filesystem-en"
        component={() => <Wi04Filesystem lang="en" />}
        durationInFrames={totalDurationFrames('wi-04-filesystem', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-05-network-services"
        component={() => <Wi05NetworkServices lang="es" />}
        durationInFrames={totalDurationFrames('wi-05-network-services', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-05-network-services-en"
        component={() => <Wi05NetworkServices lang="en" />}
        durationInFrames={totalDurationFrames('wi-05-network-services', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-01-cia-triad"
        component={() => <Ci01CiaTriad lang="es" />}
        durationInFrames={totalDurationFrames('ci-01-cia-triad', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-01-cia-triad-en"
        component={() => <Ci01CiaTriad lang="en" />}
        durationInFrames={totalDurationFrames('ci-01-cia-triad', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-02-hashes-cracking"
        component={() => <Ci02HashesCracking lang="es" />}
        durationInFrames={totalDurationFrames('ci-02-hashes-cracking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-02-hashes-cracking-en"
        component={() => <Ci02HashesCracking lang="en" />}
        durationInFrames={totalDurationFrames('ci-02-hashes-cracking', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-01-alternative-systems"
        component={() => <Ot01AlternativeSystems lang="es" />}
        durationInFrames={totalDurationFrames('ot-01-alternative-systems', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-01-alternative-systems-en"
        component={() => <Ot01AlternativeSystems lang="en" />}
        durationInFrames={totalDurationFrames('ot-01-alternative-systems', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-02-portable-devices"
        component={() => <Ot02PortableDevices lang="es" />}
        durationInFrames={totalDurationFrames('ot-02-portable-devices', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-02-portable-devices-en"
        component={() => <Ot02PortableDevices lang="en" />}
        durationInFrames={totalDurationFrames('ot-02-portable-devices', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-03-hacking-hardware"
        component={() => <Ot03HackingHardware lang="es" />}
        durationInFrames={totalDurationFrames('ot-03-hacking-hardware', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-03-hacking-hardware-en"
        component={() => <Ot03HackingHardware lang="en" />}
        durationInFrames={totalDurationFrames('ot-03-hacking-hardware', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-04-social-engineering"
        component={() => <Ot04SocialEngineering lang="es" />}
        durationInFrames={totalDurationFrames('ot-04-social-engineering', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-04-social-engineering-en"
        component={() => <Ot04SocialEngineering lang="en" />}
        durationInFrames={totalDurationFrames('ot-04-social-engineering', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-01-protocols-by-layer"
        component={() => <Re1ProtocolsByLayer lang="es" />}
        durationInFrames={totalDurationFrames('re1-01-protocols-by-layer', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-01-protocols-by-layer-en"
        component={() => <Re1ProtocolsByLayer lang="en" />}
        durationInFrames={totalDurationFrames('re1-01-protocols-by-layer', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-02-services"
        component={() => <Re1Services lang="es" />}
        durationInFrames={totalDurationFrames('re1-02-services', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-02-services-en"
        component={() => <Re1Services lang="en" />}
        durationInFrames={totalDurationFrames('re1-02-services', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-03-ports"
        component={() => <Re1Ports lang="es" />}
        durationInFrames={totalDurationFrames('re1-03-ports', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-03-ports-en"
        component={() => <Re1Ports lang="en" />}
        durationInFrames={totalDurationFrames('re1-03-ports', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-04-devices"
        component={() => <Re1Devices lang="es" />}
        durationInFrames={totalDurationFrames('re1-04-devices', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-04-devices-en"
        component={() => <Re1Devices lang="en" />}
        durationInFrames={totalDurationFrames('re1-04-devices', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-05-vlans"
        component={() => <Re1Vlans lang="es" />}
        durationInFrames={totalDurationFrames('re1-05-vlans', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-05-vlans-en"
        component={() => <Re1Vlans lang="en" />}
        durationInFrames={totalDurationFrames('re1-05-vlans', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-01-dhcp"
        component={() => <Re2Dhcp lang="es" />}
        durationInFrames={totalDurationFrames('re2-01-dhcp', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-01-dhcp-en"
        component={() => <Re2Dhcp lang="en" />}
        durationInFrames={totalDurationFrames('re2-01-dhcp', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-02-nat"
        component={() => <Re2Nat lang="es" />}
        durationInFrames={totalDurationFrames('re2-02-nat', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-02-nat-en"
        component={() => <Re2Nat lang="en" />}
        durationInFrames={totalDurationFrames('re2-02-nat', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-03-dns"
        component={() => <Re2Dns lang="es" />}
        durationInFrames={totalDurationFrames('re2-03-dns', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-03-dns-en"
        component={() => <Re2Dns lang="en" />}
        durationInFrames={totalDurationFrames('re2-03-dns', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-04-vpn"
        component={() => <Re2Vpn lang="es" />}
        durationInFrames={totalDurationFrames('re2-04-vpn', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-04-vpn-en"
        component={() => <Re2Vpn lang="en" />}
        durationInFrames={totalDurationFrames('re2-04-vpn', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-05-dmz"
        component={() => <Re2Dmz lang="es" />}
        durationInFrames={totalDurationFrames('re2-05-dmz', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-05-dmz-en"
        component={() => <Re2Dmz lang="en" />}
        durationInFrames={totalDurationFrames('re2-05-dmz', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-01-network-types"
        component={() => <Re01NetworkTypes lang="es" />}
        durationInFrames={totalDurationFrames('re-01-network-types', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-01-network-types-en"
        component={() => <Re01NetworkTypes lang="en" />}
        durationInFrames={totalDurationFrames('re-01-network-types', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-02-ip-addresses"
        component={() => <Re02IpAddresses lang="es" />}
        durationInFrames={totalDurationFrames('re-02-ip-addresses', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-02-ip-addresses-en"
        component={() => <Re02IpAddresses lang="en" />}
        durationInFrames={totalDurationFrames('re-02-ip-addresses', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-03-devices-topologies"
        component={() => <Re03DevicesTopologies lang="es" />}
        durationInFrames={totalDurationFrames('re-03-devices-topologies', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-03-devices-topologies-en"
        component={() => <Re03DevicesTopologies lang="en" />}
        durationInFrames={totalDurationFrames('re-03-devices-topologies', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-04-osi-layers"
        component={() => <Re04OsiLayers lang="es" />}
        durationInFrames={totalDurationFrames('re-04-osi-layers', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-04-osi-layers-en"
        component={() => <Re04OsiLayers lang="en" />}
        durationInFrames={totalDurationFrames('re-04-osi-layers', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-05-addressing-dns"
        component={() => <Re05AddressingDns lang="es" />}
        durationInFrames={totalDurationFrames('re-05-addressing-dns', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-05-addressing-dns-en"
        component={() => <Re05AddressingDns lang="en" />}
        durationInFrames={totalDurationFrames('re-05-addressing-dns', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-03-offline-cracking"
        component={() => <Pe03OfflineCracking lang="es" />}
        durationInFrames={totalDurationFrames('pe-03-offline-cracking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-03-offline-cracking-en"
        component={() => <Pe03OfflineCracking lang="en" />}
        durationInFrames={totalDurationFrames('pe-03-offline-cracking', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-04-online-cracking"
        component={() => <Pe04OnlineCracking lang="es" />}
        durationInFrames={totalDurationFrames('pe-04-online-cracking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-04-online-cracking-en"
        component={() => <Pe04OnlineCracking lang="en" />}
        durationInFrames={totalDurationFrames('pe-04-online-cracking', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-05-man-in-the-middle"
        component={() => <Pe05ManInTheMiddle lang="es" />}
        durationInFrames={totalDurationFrames('pe-05-man-in-the-middle', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-05-man-in-the-middle-en"
        component={() => <Pe05ManInTheMiddle lang="en" />}
        durationInFrames={totalDurationFrames('pe-05-man-in-the-middle', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-01-web-protocols"
        component={() => <Hw01WebProtocols lang="es" />}
        durationInFrames={totalDurationFrames('hw-01-web-protocols', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-01-web-protocols-en"
        component={() => <Hw01WebProtocols lang="en" />}
        durationInFrames={totalDurationFrames('hw-01-web-protocols', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-02-domains-subdirectories"
        component={() => <Hw02DomainsSubdirectories lang="es" />}
        durationInFrames={totalDurationFrames('hw-02-domains-subdirectories', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-02-domains-subdirectories-en"
        component={() => <Hw02DomainsSubdirectories lang="en" />}
        durationInFrames={totalDurationFrames('hw-02-domains-subdirectories', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-03-xss"
        component={() => <Hw03Xss lang="es" />}
        durationInFrames={totalDurationFrames('hw-03-xss', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-03-xss-en"
        component={() => <Hw03Xss lang="en" />}
        durationInFrames={totalDurationFrames('hw-03-xss', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-04-sql-injection"
        component={() => <Hw04SqlInjection lang="es" />}
        durationInFrames={totalDurationFrames('hw-04-sql-injection', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-04-sql-injection-en"
        component={() => <Hw04SqlInjection lang="en" />}
        durationInFrames={totalDurationFrames('hw-04-sql-injection', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-05-path-traversal-lfi"
        component={() => <Hw05PathTraversalLfi lang="es" />}
        durationInFrames={totalDurationFrames('hw-05-path-traversal-lfi', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-05-path-traversal-lfi-en"
        component={() => <Hw05PathTraversalLfi lang="en" />}
        durationInFrames={totalDurationFrames('hw-05-path-traversal-lfi', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-01-bash-intro"
        component={() => <Sl01BashIntro lang="es" />}
        durationInFrames={totalDurationFrames('sl-01-bash-intro', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-01-bash-intro-en"
        component={() => <Sl01BashIntro lang="en" />}
        durationInFrames={totalDurationFrames('sl-01-bash-intro', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-02-variables-conditionals"
        component={() => <Sl02VariablesConditionals lang="es" />}
        durationInFrames={totalDurationFrames('sl-02-variables-conditionals', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-02-variables-conditionals-en"
        component={() => <Sl02VariablesConditionals lang="en" />}
        durationInFrames={totalDurationFrames('sl-02-variables-conditionals', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-03-loops-functions"
        component={() => <Sl03LoopsFunctions lang="es" />}
        durationInFrames={totalDurationFrames('sl-03-loops-functions', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-03-loops-functions-en"
        component={() => <Sl03LoopsFunctions lang="en" />}
        durationInFrames={totalDurationFrames('sl-03-loops-functions', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-04-enumeration"
        component={() => <Sl04Enumeration lang="es" />}
        durationInFrames={totalDurationFrames('sl-04-enumeration', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-04-enumeration-en"
        component={() => <Sl04Enumeration lang="en" />}
        durationInFrames={totalDurationFrames('sl-04-enumeration', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-05-reverse-shells"
        component={() => <Sl05ReverseShells lang="es" />}
        durationInFrames={totalDurationFrames('sl-05-reverse-shells', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-05-reverse-shells-en"
        component={() => <Sl05ReverseShells lang="en" />}
        durationInFrames={totalDurationFrames('sl-05-reverse-shells', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-01-objects-pipeline"
        component={() => <Ps01ObjectsPipeline lang="es" />}
        durationInFrames={totalDurationFrames('ps-01-objects-pipeline', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-01-objects-pipeline-en"
        component={() => <Ps01ObjectsPipeline lang="en" />}
        durationInFrames={totalDurationFrames('ps-01-objects-pipeline', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-02-variables-conditionals"
        component={() => <Ps02VariablesConditions lang="es" />}
        durationInFrames={totalDurationFrames('ps-02-variables-conditionals', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-02-variables-conditionals-en"
        component={() => <Ps02VariablesConditions lang="en" />}
        durationInFrames={totalDurationFrames('ps-02-variables-conditionals', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-03-loops-cmdlets"
        component={() => <Ps03LoopsCmdlets lang="es" />}
        durationInFrames={totalDurationFrames('ps-03-loops-cmdlets', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-03-loops-cmdlets-en"
        component={() => <Ps03LoopsCmdlets lang="en" />}
        durationInFrames={totalDurationFrames('ps-03-loops-cmdlets', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-04-windows-enumeration"
        component={() => <Ps04WindowsEnumeration lang="es" />}
        durationInFrames={totalDurationFrames('ps-04-windows-enumeration', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-04-windows-enumeration-en"
        component={() => <Ps04WindowsEnumeration lang="en" />}
        durationInFrames={totalDurationFrames('ps-04-windows-enumeration', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-05-credentials-obfuscation"
        component={() => <Ps05CredentialsObfuscation lang="es" />}
        durationInFrames={totalDurationFrames('ps-05-credentials-obfuscation', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-05-credentials-obfuscation-en"
        component={() => <Ps05CredentialsObfuscation lang="en" />}
        durationInFrames={totalDurationFrames('ps-05-credentials-obfuscation', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-01-python-intro"
        component={() => <Py01PythonIntro lang="es" />}
        durationInFrames={totalDurationFrames('py-01-python-intro', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-01-python-intro-en"
        component={() => <Py01PythonIntro lang="en" />}
        durationInFrames={totalDurationFrames('py-01-python-intro', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-02-types-conditions"
        component={() => <Py02TypesConditions lang="es" />}
        durationInFrames={totalDurationFrames('py-02-types-conditions', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-02-types-conditions-en"
        component={() => <Py02TypesConditions lang="en" />}
        durationInFrames={totalDurationFrames('py-02-types-conditions', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-03-loops-libraries"
        component={() => <Py03LoopsLibraries lang="es" />}
        durationInFrames={totalDurationFrames('py-03-loops-libraries', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-03-loops-libraries-en"
        component={() => <Py03LoopsLibraries lang="en" />}
        durationInFrames={totalDurationFrames('py-03-loops-libraries', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-04-socket-networking"
        component={() => <Py04SocketNetworking lang="es" />}
        durationInFrames={totalDurationFrames('py-04-socket-networking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-04-socket-networking-en"
        component={() => <Py04SocketNetworking lang="en" />}
        durationInFrames={totalDurationFrames('py-04-socket-networking', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-05-http-requests"
        component={() => <Py05HttpRequests lang="es" />}
        durationInFrames={totalDurationFrames('py-05-http-requests', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-05-http-requests-en"
        component={() => <Py05HttpRequests lang="en" />}
        durationInFrames={totalDurationFrames('py-05-http-requests', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      {/* English versions (audio-en) — Sistemas Operativos (li/wi/ot) */}
      <Composition
        id="li-01-linux-history-en"
        component={() => <Li01LinuxHistory lang="en" />}
        durationInFrames={totalDurationFrames('li-01-linux-history', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-02-shell-en"
        component={() => <Li02ShellAnatomy lang="en" />}
        durationInFrames={totalDurationFrames('li-02-shell', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-03-commands-en"
        component={() => <Li03CoreCommands lang="en" />}
        durationInFrames={totalDurationFrames('li-03-commands', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-04-create-edit-en"
        component={() => <Li04CreateEdit lang="en" />}
        durationInFrames={totalDurationFrames('li-04-create-edit', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />

      {/* English versions — Redes (fr→re-0X, re1, re2) */}

      <Composition
        id="re-02-ip-addresses-en"
        component={() => <Re02IpAddresses lang="en" />}
        durationInFrames={totalDurationFrames('re-02-ip-addresses', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-03-devices-topologies-en"
        component={() => <Re03DevicesTopologies lang="en" />}
        durationInFrames={totalDurationFrames('re-03-devices-topologies', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-04-osi-layers-en"
        component={() => <Re04OsiLayers lang="en" />}
        durationInFrames={totalDurationFrames('re-04-osi-layers', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-05-addressing-dns-en"
        component={() => <Re05AddressingDns lang="en" />}
        durationInFrames={totalDurationFrames('re-05-addressing-dns', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-01-protocols-by-layer-en"
        component={() => <Re1ProtocolsByLayer lang="en" />}
        durationInFrames={totalDurationFrames('re1-01-protocols-by-layer', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-02-services-en"
        component={() => <Re1Services lang="en" />}
        durationInFrames={totalDurationFrames('re1-02-services', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-03-ports-en"
        component={() => <Re1Ports lang="en" />}
        durationInFrames={totalDurationFrames('re1-03-ports', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-04-devices-en"
        component={() => <Re1Devices lang="en" />}
        durationInFrames={totalDurationFrames('re1-04-devices', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-05-vlans-en"
        component={() => <Re1Vlans lang="en" />}
        durationInFrames={totalDurationFrames('re1-05-vlans', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-01-dhcp-en"
        component={() => <Re2Dhcp lang="en" />}
        durationInFrames={totalDurationFrames('re2-01-dhcp', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-02-nat-en"
        component={() => <Re2Nat lang="en" />}
        durationInFrames={totalDurationFrames('re2-02-nat', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-03-dns-en"
        component={() => <Re2Dns lang="en" />}
        durationInFrames={totalDurationFrames('re2-03-dns', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-04-vpn-en"
        component={() => <Re2Vpn lang="en" />}
        durationInFrames={totalDurationFrames('re2-04-vpn', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-05-dmz-en"
        component={() => <Re2Dmz lang="en" />}
        durationInFrames={totalDurationFrames('re2-05-dmz', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />

    </>
  );
};
