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
import { Hk05OfflineCracking } from './compositions/Hk05OfflineCracking';
import { Hk06OnlineCracking } from './compositions/Hk06OnlineCracking';
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
        id="hk-05-offline-cracking"
        component={Hk05OfflineCracking}
        durationInFrames={totalDurationFrames('hk-05-offline-cracking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="hk-06-online-cracking"
        component={Hk06OnlineCracking}
        durationInFrames={totalDurationFrames('hk-06-online-cracking', FPS)}
        fps={FPS}
        width={1280}
        height={720}
      />
    </>
  );
};
