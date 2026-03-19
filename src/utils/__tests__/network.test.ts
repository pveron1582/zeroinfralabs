// ── src/utils/__tests__/network.test.ts ───────────────────────────
// Tests for network utilities

import { describe, it, expect } from 'vitest';
import { generateRandomIP, assignDynamicIPs, assignDHCP } from '../network';
import type { Machine, MachineInfo } from '../../types';

describe('network utilities', () => {
  const scenarioId = 'test-scenario-01';

  describe('generateRandomIP', () => {
    it('should generate valid private IP addresses', () => {
      const ip = generateRandomIP(scenarioId, 0);
      expect(ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
      
      // Should be private IP range
      const octets = ip.split('.').map(Number);
      expect(
        octets[0] === 10 ||
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
        (octets[0] === 192 && octets[1] === 168)
      ).toBe(true);
    });

    it('should generate reproducible IPs for same inputs', () => {
      const ip1 = generateRandomIP(scenarioId, 0);
      const ip2 = generateRandomIP(scenarioId, 0);
      expect(ip1).toBe(ip2);
    });

    it('should generate different IPs for different machine indices', () => {
      const ip1 = generateRandomIP(scenarioId, 0);
      const ip2 = generateRandomIP(scenarioId, 1);
      expect(ip1).not.toBe(ip2);
    });

    it('should generate different IPs for different scenario IDs', () => {
      const ip1 = generateRandomIP('scenario-01', 0);
      const ip2 = generateRandomIP('scenario-02', 0);
      expect(ip1).not.toBe(ip2);
    });
  });

  describe('assignDynamicIPs', () => {
    const createMockMachineInfo = (ip: string = ''): MachineInfo => ({
      hostname: 'test-host',
      ip,
      mac: '00:11:22:33:44:55',
      os: 'Linux',
      status: 'active',
      type: 'target',
    });

    const createMockMachine = (id: string, hasIP = false): Machine => ({
      id,
      machine_info: createMockMachineInfo(hasIP ? `192.168.1.${id}` : ''),
      discovery_level: 0,
      scan_results: { ports: [] },
      web_enumeration: {
        web_server: '',
        cms: '',
        directories: [],
      },
      learning_steps: [],
      files: [],
      vulnerabilities: [],
      found_credentials: undefined,
    });

    it('should assign unique IPs to machines without existing IPs', () => {
      const machines = [
        createMockMachine('01'),
        createMockMachine('02'),
        createMockMachine('03'),
      ];

      const result = assignDynamicIPs(scenarioId, machines);

      expect(result).toHaveLength(3);
      expect(result[0].machine_info.ip).toBeTruthy();
      expect(result[1].machine_info.ip).toBeTruthy();
      expect(result[2].machine_info.ip).toBeTruthy();
      
      // IPs should be unique
      const ips = result.map(m => m.machine_info.ip);
      const uniqueIps = new Set(ips);
      expect(uniqueIps.size).toBe(ips.length);
    });

    it('should preserve existing IPs', () => {
      const machines = [
        createMockMachine('01', true),
        createMockMachine('02'),
        createMockMachine('03', true),
      ];

      const result = assignDynamicIPs(scenarioId, machines);

      expect(result[0].machine_info.ip).toBe('192.168.1.01');
      expect(result[2].machine_info.ip).toBe('192.168.1.03');
      expect(result[1].machine_info.ip).not.toBe('192.168.1.02');
    });

    it('should generate reproducible IPs for same scenario', () => {
      const machines1 = [createMockMachine('01'), createMockMachine('02')];
      const machines2 = [createMockMachine('01'), createMockMachine('02')];

      const result1 = assignDynamicIPs(scenarioId, machines1);
      const result2 = assignDynamicIPs(scenarioId, machines2);

      expect(result1[0].machine_info.ip).toBe(result2[0].machine_info.ip);
      expect(result1[1].machine_info.ip).toBe(result2[1].machine_info.ip);
    });

    it('should handle empty machine array', () => {
      const result = assignDynamicIPs(scenarioId, []);
      expect(result).toEqual([]);
    });

    it('should handle machines with all existing IPs', () => {
      const machines = [
        createMockMachine('01', true),
        createMockMachine('02', true),
      ];

      const result = assignDynamicIPs(scenarioId, machines);

      expect(result[0].machine_info.ip).toBe('192.168.1.01');
      expect(result[1].machine_info.ip).toBe('192.168.1.02');
    });
  });

  describe('assignDHCP (legacy)', () => {
    it('should assign sequential IPs from network range', () => {
      const machines = [
        { id: '01', machine_info: { hostname: 'test', ip: '', mac: '00:11:22:33:44:55', os: 'Linux', status: 'active', type: 'target' } } as Machine,
        { id: '02', machine_info: { hostname: 'test', ip: '', mac: '00:11:22:33:44:55', os: 'Linux', status: 'active', type: 'target' } } as Machine,
      ];

      const result = assignDHCP('192.168.1.0/24', machines);

      expect(result[0].machine_info.ip).toBe('192.168.1.10');
      expect(result[1].machine_info.ip).toBe('192.168.1.11');
    });

    it('should handle different network ranges', () => {
      const machines = [{ id: '01', machine_info: { hostname: 'test', ip: '', mac: '00:11:22:33:44:55', os: 'Linux', status: 'active', type: 'target' } } as Machine];

      const result1 = assignDHCP('10.0.0.0/8', machines);
      const result2 = assignDHCP('172.16.0.0/16', machines);

      expect(result1[0].machine_info.ip).toBe('10.0.0.10');
      expect(result2[0].machine_info.ip).toBe('172.16.0.10');
    });
  });
});
