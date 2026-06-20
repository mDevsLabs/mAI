import type { HighlighterProps, MermaidProps, NeutralColors, PrimaryColors } from '@lobehub/ui';

import type { ResponseAnimationStyle } from '../../aiProvider';

export type AnimationMode = 'disabled' | 'agile' | 'elegant';

export type ContextMenuMode = 'disabled' | 'default';

export interface UserGeneralConfig {
  animationMode?: AnimationMode;
  contextMenuMode?: ContextMenuMode;
  costEstimateWarningThreshold?: number;
  /**
   * Whether to auto-scroll during AI streaming output
   * @default true
   */
  enableAutoScrollOnStreaming?: boolean;
  fontSize: number;
  highlighterTheme?: HighlighterProps['theme'];
  isDevMode: boolean;
  isLiteMode: boolean;
  mermaidTheme?: MermaidProps['theme'];
  neutralColor?: NeutralColors;
  primaryColor?: PrimaryColors;
  responseLanguage?: string;
  telemetry: boolean;
  timezone?: string;
  transitionMode?: ResponseAnimationStyle;
  enablePets?: boolean;
  pets?: string[];
  petsLevel?: number;
  petsMsgCount?: number;
  petsZoom?: number;
  petsSound?: boolean;
  petsVolume?: number;
  petsAnim?: boolean;
  petsAcc?: boolean;
  petsBg?: boolean;
  petsColor?: boolean;
  petsWeather?: boolean;
  petsAura?: boolean;
  petsCitations?: boolean;
  petsEncouragements?: boolean;
}

