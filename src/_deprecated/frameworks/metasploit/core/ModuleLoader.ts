// ── frameworks/metasploit/core/ModuleLoader.ts ─────────────────────
// Dynamic module discovery and loading for Metasploit Framework

import type { MsfModule, ModuleType, ModuleIndex } from '../modules/types';

// ── Module Registry ──────────────────────────────────────────────
class ModuleRegistry {
  private modules = new Map<string, MsfModule>();
  private byType: Record<ModuleType, Set<string>> = {
    auxiliary: new Set(),
    exploit: new Set(),
    post: new Set(),
    payload: new Set(),
    encoder: new Set(),
    nop: new Set(),
  };
  private byPlatform = new Map<string, Set<string>>();

  // Register a single module
  register(module: MsfModule): void {
    if (this.modules.has(module.path)) {
      console.warn(`Module ${module.path} already registered, overwriting`);
    }
    
    this.modules.set(module.path, module);
    this.byType[module.type].add(module.path);
    
    // Index by platform for exploits and payloads
    if ('platform' in module && module.platform) {
      if (!this.byPlatform.has(module.platform)) {
        this.byPlatform.set(module.platform, new Set());
      }
      this.byPlatform.get(module.platform)!.add(module.path);
    }
  }

  // Register multiple modules at once
  registerMany(modules: MsfModule[]): void {
    modules.forEach(m => this.register(m));
  }

  // Get module by path
  get(path: string): MsfModule | undefined {
    return this.modules.get(path);
  }

  // Check if module exists
  has(path: string): boolean {
    return this.modules.has(path);
  }

  // Get all modules of a type
  getByType(type: ModuleType): MsfModule[] {
    return Array.from(this.byType[type])
      .map(path => this.modules.get(path)!)
      .filter(Boolean);
  }

  // Get modules by platform
  getByPlatform(platform: string): MsfModule[] {
    const paths = this.byPlatform.get(platform);
    if (!paths) return [];
    return Array.from(paths)
      .map(path => this.modules.get(path)!)
      .filter(Boolean);
  }

  // Search modules by keyword
  search(keyword: string): MsfModule[] {
    const lower = keyword.toLowerCase();
    return Array.from(this.modules.values()).filter(m =>
      m.path.toLowerCase().includes(lower) ||
      m.name.toLowerCase().includes(lower) ||
      m.description.toLowerCase().includes(lower)
    );
  }

  // Get all registered module paths
  getAllPaths(): string[] {
    return Array.from(this.modules.keys());
  }

  // Get total count
  get count(): number {
    return this.modules.size;
  }

  // Create index for fast lookups
  createIndex(): ModuleIndex {
    const byType: Record<ModuleType, string[]> = {
      auxiliary: Array.from(this.byType.auxiliary),
      exploit: Array.from(this.byType.exploit),
      post: Array.from(this.byType.post),
      payload: Array.from(this.byType.payload),
      encoder: Array.from(this.byType.encoder),
      nop: Array.from(this.byType.nop),
    };

    const byPlatform: Record<string, string[]> = {};
    this.byPlatform.forEach((paths, platform) => {
      byPlatform[platform] = Array.from(paths);
    });

    return {
      modules: new Map(this.modules),
      byType,
      byPlatform,
    };
  }

  // Reset registry (useful for testing)
  reset(): void {
    this.modules.clear();
    Object.values(this.byType).forEach(set => set.clear());
    this.byPlatform.clear();
  }
}

// ── Singleton Instance ──────────────────────────────────────────────
const registry = new ModuleRegistry();

// ── Module Loader Functions ────────────────────────────────────────

/**
 * Load a module dynamically from a file
 * In a real dynamic system, this would use import() or require()
 * For now, we use static imports with a registry pattern
 */
export async function loadModule(path: string): Promise<MsfModule | null> {
  // Check if already loaded
  const existing = registry.get(path);
  if (existing) return existing;

  // For now, modules must be explicitly registered
  // In a future version with true dynamic loading, this would:
  // 1. Try to import the module file
  // 2. Validate its structure
  // 3. Register it
  
  console.warn(`Module ${path} not found in registry. Make sure to register it first.`);
  return null;
}

/**
 * Initialize the module loader with all available modules
 * This should be called once at app startup
 */
export function initializeModuleLoader(modules: MsfModule[]): ModuleIndex {
  registry.reset();
  registry.registerMany(modules);
  return registry.createIndex();
}

/**
 * Get module statistics for display
 */
export function getModuleStats(): Record<string, number> {
  return {
    total: registry.count,
    auxiliary: registry.getByType('auxiliary').length,
    exploits: registry.getByType('exploit').length,
    payloads: registry.getByType('payload').length,
    post: registry.getByType('post').length,
    encoders: registry.getByType('encoder').length,
    nops: registry.getByType('nop').length,
  };
}

// ── Helper Functions ───────────────────────────────────────────────

/**
 * Shorten module path for display
 * e.g., 'exploit/windows/smb/ms17_010_eternalblue' → 'ms17_010_eternalblue'
 */
export function shortModuleName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

/**
 * Get module type display name
 */
export function moduleTypeDisplay(type: ModuleType): string {
  const displays: Record<ModuleType, string> = {
    auxiliary: 'auxiliary',
    exploit: 'exploit',
    post: 'post',
    payload: 'payload',
    encoder: 'encoder',
    nop: 'nop',
  };
  return displays[type];
}

/**
 * Validate that an options object has all required options for a module
 */
export function validateModuleOptions(
  module: MsfModule,
  options: Record<string, string>
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const [key, opt] of Object.entries(module.options)) {
    if (opt.required && (!options[key] || options[key].trim() === '')) {
      missing.push(key);
    }
  }
  
  return { valid: missing.length === 0, missing };
}

// ── Re-exports ─────────────────────────────────────────────────────
export { registry as moduleRegistry };
export type { MsfModule, ModuleType };
