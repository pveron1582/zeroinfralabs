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
import { Li01LinuxHistoryEn } from './compositions/Li01LinuxHistoryEn';
import { Li02ShellAnatomyEn } from './compositions/Li02ShellAnatomyEn';
import { Li03CoreCommandsEn } from './compositions/Li03CoreCommandsEn';
import { Li04CreateEditEn } from './compositions/Li04CreateEditEn';
import { Li05PermissionsEn } from './compositions/Li05PermissionsEn';
import { Wi01WindowsHistoryEn } from './compositions/Wi01WindowsHistoryEn';
import { Wi02CurrentVersionsEn } from './compositions/Wi02CurrentVersionsEn';
import { Wi03SecurityEn } from './compositions/Wi03SecurityEn';
import { Wi04FilesystemEn } from './compositions/Wi04FilesystemEn';
import { Wi05NetworkServicesEn } from './compositions/Wi05NetworkServicesEn';
import { Ot01AlternativeSystemsEn } from './compositions/Ot01AlternativeSystemsEn';
import { Ot02PortableDevicesEn } from './compositions/Ot02PortableDevicesEn';
import { Ot03HackingHardwareEn } from './compositions/Ot03HackingHardwareEn';
import { Ot04SocialEngineeringEn } from './compositions/Ot04SocialEngineeringEn';
import { Re01NetworkTypesEn } from './compositions/Re01NetworkTypesEn';
import { Re02IpAddressesEn } from './compositions/Re02IpAddressesEn';
import { Re03DevicesTopologiesEn } from './compositions/Re03DevicesTopologiesEn';
import { Re04OsiLayersEn } from './compositions/Re04OsiLayersEn';
import { Re05AddressingDnsEn } from './compositions/Re05AddressingDnsEn';
import { Re1ProtocolsByLayerEn } from './compositions/Re1ProtocolsByLayerEn';
import { Re1ServicesEn } from './compositions/Re1ServicesEn';
import { Re1PortsEn } from './compositions/Re1PortsEn';
import { Re1DevicesEn } from './compositions/Re1DevicesEn';
import { Re1VlansEn } from './compositions/Re1VlansEn';
import { Re2DhcpEn } from './compositions/Re2DhcpEn';
import { Re2NatEn } from './compositions/Re2NatEn';
import { Re2DnsEn } from './compositions/Re2DnsEn';
import { Re2VpnEn } from './compositions/Re2VpnEn';
import { Re2DmzEn } from './compositions/Re2DmzEn';
import { Ci01CiaTriadEn } from './compositions/Ci01CiaTriadEn';
import { Ci02HashesCrackingEn } from './compositions/Ci02HashesCrackingEn';
import { Ci03InformationGatheringEn } from './compositions/Ci03InformationGatheringEn';
import { Ci04CryptographyEn } from './compositions/Ci04CryptographyEn';
import { Ci05OwaspTopTenEn } from './compositions/Ci05OwaspTopTenEn';
import { Hw01WebProtocolsEn } from './compositions/Hw01WebProtocolsEn';
import { Hw02DomainsSubdirectoriesEn } from './compositions/Hw02DomainsSubdirectoriesEn';
import { Pe01PentestPhasesEn } from './compositions/Pe01PentestPhasesEn';
import { Pe02FilesystemEn } from './compositions/Pe02FilesystemEn';
import { Pe03OfflineCrackingEn } from './compositions/Pe03OfflineCrackingEn';
import { Pe04OnlineCrackingEn } from './compositions/Pe04OnlineCrackingEn';
import { Pe05ManInTheMiddleEn } from './compositions/Pe05ManInTheMiddleEn';
import { Hw03XssEn } from './compositions/Hw03XssEn';
import { Hw04SqlInjectionEn } from './compositions/Hw04SqlInjectionEn';
import { Hw05PathTraversalLfiEn } from './compositions/Hw05PathTraversalLfiEn';
import { Sl01BashIntroEn } from './compositions/Sl01BashIntroEn';
import { Sl02VariablesConditionalsEn } from './compositions/Sl02VariablesConditionalsEn';
import { Sl03LoopsFunctionsEn } from './compositions/Sl03LoopsFunctionsEn';
import { Sl04EnumerationEn } from './compositions/Sl04EnumerationEn';
import { Sl05ReverseShellsEn } from './compositions/Sl05ReverseShellsEn';
import { Ps01ObjectsPipelineEn } from './compositions/Ps01ObjectsPipelineEn';
import { Ps02VariablesConditionsEn } from './compositions/Ps02VariablesConditionsEn';
import { Ps03LoopsCmdletsEn } from './compositions/Ps03LoopsCmdletsEn';
import { Ps04WindowsEnumerationEn } from './compositions/Ps04WindowsEnumerationEn';
import { Ps05CredentialsObfuscationEn } from './compositions/Ps05CredentialsObfuscationEn';
import { Py01PythonIntroEn } from './compositions/Py01PythonIntroEn';
import { Py02TypesConditionsEn } from './compositions/Py02TypesConditionsEn';
import { Py03LoopsLibrariesEn } from './compositions/Py03LoopsLibrariesEn';
import { Py04SocketNetworkingEn } from './compositions/Py04SocketNetworkingEn';
import { Py05HttpRequestsEn } from './compositions/Py05HttpRequestsEn';
import { totalDurationFrames } from './audioTimings';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="pe-01-pentest-phases"
        component={Pe01PentestPhases}
        durationInFrames={totalDurationFrames('pe-01-pentest-phases', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-02-filesystem"
        component={Pe02Filesystem}
        durationInFrames={totalDurationFrames('pe-02-filesystem', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-03-information-gathering"
        component={Ci03InformationGathering}
        durationInFrames={totalDurationFrames('ci-03-information-gathering', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-04-cryptography"
        component={Ci04Cryptography}
        durationInFrames={totalDurationFrames('ci-04-cryptography', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-05-owasp-top-ten"
        component={Ci05OwaspTopTen}
        durationInFrames={totalDurationFrames('ci-05-owasp-top-ten', FPS)}
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
        component={Li02ShellAnatomy}
        durationInFrames={totalDurationFrames('li-02-shell', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-03-core-commands"
        component={Li03CoreCommands}
        durationInFrames={totalDurationFrames('li-03-commands', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-04-create-edit"
        component={Li04CreateEdit}
        durationInFrames={totalDurationFrames('li-04-create-edit', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-05-permissions"
        component={Li05Permissions}
        durationInFrames={totalDurationFrames('li-05-permissions', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-01-windows-history"
        component={Wi01WindowsHistory}
        durationInFrames={totalDurationFrames('wi-01-windows-history', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-02-current-versions"
        component={Wi02CurrentVersions}
        durationInFrames={totalDurationFrames('wi-02-current-versions', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-03-security"
        component={Wi03Security}
        durationInFrames={totalDurationFrames('wi-03-security', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-04-filesystem"
        component={Wi04Filesystem}
        durationInFrames={totalDurationFrames('wi-04-filesystem', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-05-network-services"
        component={Wi05NetworkServices}
        durationInFrames={totalDurationFrames('wi-05-network-services', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-01-cia-triad"
        component={Ci01CiaTriad}
        durationInFrames={totalDurationFrames('ci-01-cia-triad', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-02-hashes-cracking"
        component={Ci02HashesCracking}
        durationInFrames={totalDurationFrames('ci-02-hashes-cracking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-01-alternative-systems"
        component={Ot01AlternativeSystems}
        durationInFrames={totalDurationFrames('ot-01-alternative-systems', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-02-portable-devices"
        component={Ot02PortableDevices}
        durationInFrames={totalDurationFrames('ot-02-portable-devices', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-03-hacking-hardware"
        component={Ot03HackingHardware}
        durationInFrames={totalDurationFrames('ot-03-hacking-hardware', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-04-social-engineering"
        component={Ot04SocialEngineering}
        durationInFrames={totalDurationFrames('ot-04-social-engineering', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-01-protocols-by-layer"
        component={Re1ProtocolsByLayer}
        durationInFrames={totalDurationFrames('re1-01-protocols-by-layer', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-03-ports"
        component={Re1Ports}
        durationInFrames={totalDurationFrames('re1-03-ports', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-02-services"
        component={Re1Services}
        durationInFrames={totalDurationFrames('re1-02-services', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-04-devices"
        component={Re1Devices}
        durationInFrames={totalDurationFrames('re1-04-devices', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-05-vlans"
        component={Re1Vlans}
        durationInFrames={totalDurationFrames('re1-05-vlans', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-01-dhcp"
        component={Re2Dhcp}
        durationInFrames={totalDurationFrames('re2-01-dhcp', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-02-nat"
        component={Re2Nat}
        durationInFrames={totalDurationFrames('re2-02-nat', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-03-dns"
        component={Re2Dns}
        durationInFrames={totalDurationFrames('re2-03-dns', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-04-vpn"
        component={Re2Vpn}
        durationInFrames={totalDurationFrames('re2-04-vpn', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-05-dmz"
        component={Re2Dmz}
        durationInFrames={totalDurationFrames('re2-05-dmz', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-01-network-types"
        component={Re01NetworkTypes}
        durationInFrames={totalDurationFrames('re-01-network-types', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-02-ip-addresses"
        component={Re02IpAddresses}
        durationInFrames={totalDurationFrames('re-02-ip-addresses', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-03-devices-topologies"
        component={Re03DevicesTopologies}
        durationInFrames={totalDurationFrames('re-03-devices-topologies', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-04-osi-layers"
        component={Re04OsiLayers}
        durationInFrames={totalDurationFrames('re-04-osi-layers', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-05-addressing-dns"
        component={Re05AddressingDns}
        durationInFrames={totalDurationFrames('re-05-addressing-dns', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-03-offline-cracking"
        component={Pe03OfflineCracking}
        durationInFrames={totalDurationFrames('pe-03-offline-cracking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-04-online-cracking"
        component={Pe04OnlineCracking}
        durationInFrames={totalDurationFrames('pe-04-online-cracking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-05-man-in-the-middle"
        component={Pe05ManInTheMiddle}
        durationInFrames={totalDurationFrames('pe-05-man-in-the-middle', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-01-web-protocols"
        component={Hw01WebProtocols}
        durationInFrames={totalDurationFrames('hw-01-web-protocols', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-02-domains-subdirectories"
        component={Hw02DomainsSubdirectories}
        durationInFrames={totalDurationFrames('hw-02-domains-subdirectories', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-03-xss"
        component={Hw03Xss}
        durationInFrames={totalDurationFrames('hw-03-xss', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-04-sql-injection"
        component={Hw04SqlInjection}
        durationInFrames={totalDurationFrames('hw-04-sql-injection', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-05-path-traversal-lfi"
        component={Hw05PathTraversalLfi}
        durationInFrames={totalDurationFrames('hw-05-path-traversal-lfi', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-01-bash-intro"
        component={Sl01BashIntro}
        durationInFrames={totalDurationFrames('sl-01-bash-intro', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-02-variables-conditionals"
        component={Sl02VariablesConditionals}
        durationInFrames={totalDurationFrames('sl-02-variables-conditionals', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-03-loops-functions"
        component={Sl03LoopsFunctions}
        durationInFrames={totalDurationFrames('sl-03-loops-functions', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-04-enumeration"
        component={Sl04Enumeration}
        durationInFrames={totalDurationFrames('sl-04-enumeration', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-05-reverse-shells"
        component={Sl05ReverseShells}
        durationInFrames={totalDurationFrames('sl-05-reverse-shells', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-01-objects-pipeline"
        component={Ps01ObjectsPipeline}
        durationInFrames={totalDurationFrames('ps-01-objects-pipeline', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-02-variables-conditionals"
        component={Ps02VariablesConditions}
        durationInFrames={totalDurationFrames('ps-02-variables-conditionals', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-03-loops-cmdlets"
        component={Ps03LoopsCmdlets}
        durationInFrames={totalDurationFrames('ps-03-loops-cmdlets', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-04-windows-enumeration"
        component={Ps04WindowsEnumeration}
        durationInFrames={totalDurationFrames('ps-04-windows-enumeration', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-05-credentials-obfuscation"
        component={Ps05CredentialsObfuscation}
        durationInFrames={totalDurationFrames('ps-05-credentials-obfuscation', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-01-python-intro"
        component={Py01PythonIntro}
        durationInFrames={totalDurationFrames('py-01-python-intro', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-02-types-conditions"
        component={Py02TypesConditions}
        durationInFrames={totalDurationFrames('py-02-types-conditions', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-03-loops-libraries"
        component={Py03LoopsLibraries}
        durationInFrames={totalDurationFrames('py-03-loops-libraries', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-04-socket-networking"
        component={Py04SocketNetworking}
        durationInFrames={totalDurationFrames('py-04-socket-networking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-05-http-requests"
        component={Py05HttpRequests}
        durationInFrames={totalDurationFrames('py-05-http-requests', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      {/* English versions (audio-en) — Sistemas Operativos (li/wi/ot) */}
      <Composition
        id="li-01-linux-history-en"
        component={Li01LinuxHistoryEn}
        durationInFrames={totalDurationFrames('li-01-linux-history', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-02-shell-en"
        component={Li02ShellAnatomyEn}
        durationInFrames={totalDurationFrames('li-02-shell', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-03-commands-en"
        component={Li03CoreCommandsEn}
        durationInFrames={totalDurationFrames('li-03-commands', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-04-create-edit-en"
        component={Li04CreateEditEn}
        durationInFrames={totalDurationFrames('li-04-create-edit', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="li-05-permissions-en"
        component={Li05PermissionsEn}
        durationInFrames={totalDurationFrames('li-05-permissions', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-01-windows-history-en"
        component={Wi01WindowsHistoryEn}
        durationInFrames={totalDurationFrames('wi-01-windows-history', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-02-current-versions-en"
        component={Wi02CurrentVersionsEn}
        durationInFrames={totalDurationFrames('wi-02-current-versions', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-03-security-en"
        component={Wi03SecurityEn}
        durationInFrames={totalDurationFrames('wi-03-security', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-04-filesystem-en"
        component={Wi04FilesystemEn}
        durationInFrames={totalDurationFrames('wi-04-filesystem', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="wi-05-network-services-en"
        component={Wi05NetworkServicesEn}
        durationInFrames={totalDurationFrames('wi-05-network-services', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-01-alternative-systems-en"
        component={Ot01AlternativeSystemsEn}
        durationInFrames={totalDurationFrames('ot-01-alternative-systems', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-02-portable-devices-en"
        component={Ot02PortableDevicesEn}
        durationInFrames={totalDurationFrames('ot-02-portable-devices', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-03-hacking-hardware-en"
        component={Ot03HackingHardwareEn}
        durationInFrames={totalDurationFrames('ot-03-hacking-hardware', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ot-04-social-engineering-en"
        component={Ot04SocialEngineeringEn}
        durationInFrames={totalDurationFrames('ot-04-social-engineering', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      {/* English versions — Redes (fr→re-0X, re1, re2) */}
      <Composition
        id="re-01-network-types-en"
        component={Re01NetworkTypesEn}
        durationInFrames={totalDurationFrames('re-01-network-types', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-02-ip-addresses-en"
        component={Re02IpAddressesEn}
        durationInFrames={totalDurationFrames('re-02-ip-addresses', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-03-devices-topologies-en"
        component={Re03DevicesTopologiesEn}
        durationInFrames={totalDurationFrames('re-03-devices-topologies', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-04-osi-layers-en"
        component={Re04OsiLayersEn}
        durationInFrames={totalDurationFrames('re-04-osi-layers', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re-05-addressing-dns-en"
        component={Re05AddressingDnsEn}
        durationInFrames={totalDurationFrames('re-05-addressing-dns', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-01-protocols-by-layer-en"
        component={Re1ProtocolsByLayerEn}
        durationInFrames={totalDurationFrames('re1-01-protocols-by-layer', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-02-services-en"
        component={Re1ServicesEn}
        durationInFrames={totalDurationFrames('re1-02-services', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-03-ports-en"
        component={Re1PortsEn}
        durationInFrames={totalDurationFrames('re1-03-ports', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-04-devices-en"
        component={Re1DevicesEn}
        durationInFrames={totalDurationFrames('re1-04-devices', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re1-05-vlans-en"
        component={Re1VlansEn}
        durationInFrames={totalDurationFrames('re1-05-vlans', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-01-dhcp-en"
        component={Re2DhcpEn}
        durationInFrames={totalDurationFrames('re2-01-dhcp', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-02-nat-en"
        component={Re2NatEn}
        durationInFrames={totalDurationFrames('re2-02-nat', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-03-dns-en"
        component={Re2DnsEn}
        durationInFrames={totalDurationFrames('re2-03-dns', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-04-vpn-en"
        component={Re2VpnEn}
        durationInFrames={totalDurationFrames('re2-04-vpn', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="re2-05-dmz-en"
        component={Re2DmzEn}
        durationInFrames={totalDurationFrames('re2-05-dmz', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      {/* English versions — Hacking Ético (ci, hw completos de la 1ª tanda) */}
      <Composition
        id="ci-01-cia-triad-en"
        component={Ci01CiaTriadEn}
        durationInFrames={totalDurationFrames('ci-01-cia-triad', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-02-hashes-cracking-en"
        component={Ci02HashesCrackingEn}
        durationInFrames={totalDurationFrames('ci-02-hashes-cracking', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-03-information-gathering-en"
        component={Ci03InformationGatheringEn}
        durationInFrames={totalDurationFrames('ci-03-information-gathering', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-04-cryptography-en"
        component={Ci04CryptographyEn}
        durationInFrames={totalDurationFrames('ci-04-cryptography', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ci-05-owasp-top-ten-en"
        component={Ci05OwaspTopTenEn}
        durationInFrames={totalDurationFrames('ci-05-owasp-top-ten', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-01-web-protocols-en"
        component={Hw01WebProtocolsEn}
        durationInFrames={totalDurationFrames('hw-01-web-protocols', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-02-domains-subdirectories-en"
        component={Hw02DomainsSubdirectoriesEn}
        durationInFrames={totalDurationFrames('hw-02-domains-subdirectories', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      {/* English versions — Hacking Ético 2ª tanda (pe, hw-03..05) */}
      <Composition
        id="pe-01-pentest-phases-en"
        component={Pe01PentestPhasesEn}
        durationInFrames={totalDurationFrames('pe-01-pentest-phases', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-02-filesystem-en"
        component={Pe02FilesystemEn}
        durationInFrames={totalDurationFrames('pe-02-filesystem', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-03-offline-cracking-en"
        component={Pe03OfflineCrackingEn}
        durationInFrames={totalDurationFrames('pe-03-offline-cracking', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-04-online-cracking-en"
        component={Pe04OnlineCrackingEn}
        durationInFrames={totalDurationFrames('pe-04-online-cracking', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="pe-05-man-in-the-middle-en"
        component={Pe05ManInTheMiddleEn}
        durationInFrames={totalDurationFrames('pe-05-man-in-the-middle', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-03-xss-en"
        component={Hw03XssEn}
        durationInFrames={totalDurationFrames('hw-03-xss', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-04-sql-injection-en"
        component={Hw04SqlInjectionEn}
        durationInFrames={totalDurationFrames('hw-04-sql-injection', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hw-05-path-traversal-lfi-en"
        component={Hw05PathTraversalLfiEn}
        durationInFrames={totalDurationFrames('hw-05-path-traversal-lfi', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      {/* English versions — Scripting (sl, ps, py) */}
      <Composition
        id="sl-01-bash-intro-en"
        component={Sl01BashIntroEn}
        durationInFrames={totalDurationFrames('sl-01-bash-intro', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-02-variables-conditionals-en"
        component={Sl02VariablesConditionalsEn}
        durationInFrames={totalDurationFrames('sl-02-variables-conditionals', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-03-loops-functions-en"
        component={Sl03LoopsFunctionsEn}
        durationInFrames={totalDurationFrames('sl-03-loops-functions', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-04-enumeration-en"
        component={Sl04EnumerationEn}
        durationInFrames={totalDurationFrames('sl-04-enumeration', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="sl-05-reverse-shells-en"
        component={Sl05ReverseShellsEn}
        durationInFrames={totalDurationFrames('sl-05-reverse-shells', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-01-objects-pipeline-en"
        component={Ps01ObjectsPipelineEn}
        durationInFrames={totalDurationFrames('ps-01-objects-pipeline', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-02-variables-conditionals-en"
        component={Ps02VariablesConditionsEn}
        durationInFrames={totalDurationFrames('ps-02-variables-conditionals', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-03-loops-cmdlets-en"
        component={Ps03LoopsCmdletsEn}
        durationInFrames={totalDurationFrames('ps-03-loops-cmdlets', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-04-windows-enumeration-en"
        component={Ps04WindowsEnumerationEn}
        durationInFrames={totalDurationFrames('ps-04-windows-enumeration', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="ps-05-credentials-obfuscation-en"
        component={Ps05CredentialsObfuscationEn}
        durationInFrames={totalDurationFrames('ps-05-credentials-obfuscation', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-01-python-intro-en"
        component={Py01PythonIntroEn}
        durationInFrames={totalDurationFrames('py-01-python-intro', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-02-types-conditions-en"
        component={Py02TypesConditionsEn}
        durationInFrames={totalDurationFrames('py-02-types-conditions', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-03-loops-libraries-en"
        component={Py03LoopsLibrariesEn}
        durationInFrames={totalDurationFrames('py-03-loops-libraries', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-04-socket-networking-en"
        component={Py04SocketNetworkingEn}
        durationInFrames={totalDurationFrames('py-04-socket-networking', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="py-05-http-requests-en"
        component={Py05HttpRequestsEn}
        durationInFrames={totalDurationFrames('py-05-http-requests', FPS, 'en')}
        fps={FPS}
        width={1280}
        height={720}
      />
    </>
  );
};
