/** Text Tuner v3 — public API declarations (ADR-0009). */

export const SCHEMA_VERSION: string;

export interface SplitScrollConfig {
  __schema?: string;
  targets: { element: string; text: string };
  splitText: {
    type: string;
    mask: string;
    autoSplit: boolean;
    smartSplit: boolean;
  };
  animate: string;
  from: Record<string, unknown>;
  to: Record<string, unknown>;
  stagger: Record<string, unknown>;
  scrollTrigger: Record<string, unknown>;
  typography: {
    fontVar: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    textAlign: string;
    textTransform: string;
  };
}

export interface RegistryEntry {
  label: string;
  defaults: SplitScrollConfig;
  init?: (config: SplitScrollConfig) => unknown;
}

export interface FontFamily {
  slug: string;
  label: string;
  cssVar: string;
  family: string;
}

export interface AttachOptions {
  activeId?: string;
  fallbackId?: string;
  storageKey?: string;
  targets?: string;
  typographyScope?: string;
  typographyTarget?: string;
  fontsManifest?: string;
  fonts?: FontFamily[];
  followViewport?: boolean;
  productionEnabled?: boolean;
  discover?: { defaults?: Partial<SplitScrollConfig> };
  /** v2 compat — single-instance without discover() */
  init?: (config: SplitScrollConfig) => unknown;
  defaults?: SplitScrollConfig;
  initFn?: (config: SplitScrollConfig) => unknown;
}

export interface ConvertResult {
  config: SplitScrollConfig | null;
  warnings: string[];
}

export function buildScaffoldConfig(
  id: string,
  globalOverrides?: Partial<SplitScrollConfig>
): SplitScrollConfig;

export const DEFAULT_CONFIG: SplitScrollConfig;

export function createSplitScrollRunner(config: SplitScrollConfig): {
  teardown?: () => void;
  runtime?: { applyLive: (patch: Partial<SplitScrollConfig>) => void };
};

export function define(entries: Record<string, SplitScrollConfig>): void;
export function getDefined(): Record<string, SplitScrollConfig>;
export function getDefinedConfig(id: string): SplitScrollConfig | null;

export function discover(options?: { defaults?: Partial<SplitScrollConfig> }): Record<
  string,
  RegistryEntry
>;
export function getRegistry(): Record<string, RegistryEntry> | null;
export function getActiveId(fallback?: string, registry?: Record<string, RegistryEntry>): string;

export function attach(options?: AttachOptions): Promise<{
  activeId: string;
  registry: Record<string, RegistryEntry>;
  instances: Record<string, unknown>;
  manager?: unknown;
  switchToInstance?: (id: string) => Promise<void>;
} | null>;

export function isActive(): boolean;
export function initAll(registry?: Record<string, RegistryEntry>): Record<string, unknown>;
export function setRunnerFactory(factory: (config: SplitScrollConfig) => unknown): void;
export function getActiveInstanceId(): string | null;
export function getLiveInstances(): Record<string, unknown>;
export function getInstanceManager(): unknown;

export function resolveFonts(options?: AttachOptions): Promise<FontFamily[]>;
export function normalizeFamilies(families: unknown[]): FontFamily[];
export const STARTER_FONT_FALLBACK: FontFamily[];

export function convert(source: string, options?: { id?: string }): ConvertResult;
export function buildCanonicalBlock(cfg: SplitScrollConfig): string;
export function serializeConfig(cfg: SplitScrollConfig): string;

export function attachPanel(options: AttachOptions): unknown;
export function isPanelActive(): boolean;
export function installV2Shim(): void;

export * as schema from "./src/schema/index.js";
export * as runner from "./src/runner/index.js";
export * as panel from "./src/panel/index.js";
