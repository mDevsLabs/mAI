'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { memo } from 'react';

import AuthIcons from '@/components/AuthIcons';

// ─────────────────────────────────────────────────────────────
// Static styles — zero runtime (createStaticStyles + cssVar.*)
// createStaticStyles returns a plain object, NOT a hook.
// ─────────────────────────────────────────────────────────────
const styles = createStaticStyles(({ css, cssVar }) => ({
  // ── Grid container ──────────────────────────────────────────
  gridContainer: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  // ── Shared row wrapper ──────────────────────────────────────
  row: css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    padding: 14px 12px;
    border-radius: 12px;
  `,

  // ── Dark row (ligne 1) ──────────────────────────────────────
  rowDark: css`
    background: #111111;
    border: 1px solid rgba(255, 255, 255, 0.08);
  `,

  // ── Light row (ligne 2) ─────────────────────────────────────
  rowLight: css`
    background: ${cssVar.colorBgContainer};
    border: 1px solid ${cssVar.colorBorderSecondary};
  `,

  // ── Individual button wrapper ───────────────────────────────
  btnWrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    flex: 1;
    min-width: 0;
    user-select: none;
    border-radius: 8px;
    padding: 4px 2px;
    transition: background 0.15s ease;

    &:hover {
      background: rgba(128, 128, 128, 0.1);
    }

    &:active {
      background: rgba(128, 128, 128, 0.18);
    }
  `,

  // ── Circle — dark variant ───────────────────────────────────
  circleDark: css`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: #222222;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, border-color 0.15s ease;
    position: relative;
    flex-shrink: 0;

    &:hover {
      background: #2e2e2e;
      border-color: rgba(255, 255, 255, 0.18);
    }
  `,

  // ── Circle — light variant ──────────────────────────────────
  circleLight: css`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: ${cssVar.colorFillQuaternary};
    border: 1px solid ${cssVar.colorBorderSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, border-color 0.15s ease;
    position: relative;
    flex-shrink: 0;

    &:hover {
      background: ${cssVar.colorFillTertiary};
      border-color: ${cssVar.colorBorder};
    }
  `,

  // ── Provider label below circle ─────────────────────────────
  labelDark: css`
    font-size: 10px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    line-height: 1.3;
  `,

  labelLight: css`
    font-size: 10px;
    font-weight: 400;
    color: ${cssVar.colorTextQuaternary};
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    line-height: 1.3;
  `,

  // ── Loading spinner overlay ─────────────────────────────────
  loadingOverlay: css`
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
  `,

  loadingSpinner: css`
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
}));

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface SocialButtonGridProps {
  /**
   * Ordered list of provider IDs for the dark row (row 1).
   * Defaults to: ['google', 'slack', 'canva', 'telegram', 'railway']
   */
  darkRowProviders?: string[];
  /**
   * Ordered list of provider IDs for the light row (row 2).
   * Defaults to: ['github', 'x', 'twitch', 'notion', 'spotify']
   */
  lightRowProviders?: string[];
  /** Provider ID currently in loading state */
  socialLoading: string | null;
  /** Callback when a provider button is clicked */
  onSocialSignIn: (provider: string) => void;
}

const DEFAULT_DARK_ROW = ['google', 'slack', 'canva', 'telegram', 'railway'];
const DEFAULT_LIGHT_ROW = ['github', 'x', 'twitch', 'notion', 'spotify'];

// ─────────────────────────────────────────────────────────────
// Helper: turn provider id into a short display name only
// e.g. 'google' → 'Google', 'microsoft-entra-id' → 'Microsoft'
// ─────────────────────────────────────────────────────────────
const DISPLAY_NAMES: Record<string, string> = {
  'google': 'Google',
  'github': 'GitHub',
  'slack': 'Slack',
  'canva': 'Canva',
  'telegram': 'Telegram',
  'railway': 'Railway',
  'x': 'X',
  'twitch': 'Twitch',
  'notion': 'Notion',
  'spotify': 'Spotify',
  'microsoft': 'Microsoft',
  'apple': 'Apple',
  'auth0': 'Auth0',
  'logto': 'Logto',
};

const toShortName = (id: string): string => {
  if (DISPLAY_NAMES[id]) return DISPLAY_NAMES[id];
  // Fallback: capitalise first segment before dash/underscore
  return id
    .split(/[-_]/)[0]!
    .replace(/^\w/, (c) => c.toUpperCase());
};

// ─────────────────────────────────────────────────────────────
// Single circular button
// ─────────────────────────────────────────────────────────────
interface CircleButtonProps {
  isLoading: boolean;
  label: string;
  provider: string;
  variant: 'dark' | 'light';
  onClick: () => void;
}

const CircleButton = memo<CircleButtonProps>(({ provider, variant, isLoading, label, onClick }) => {
  const isDark = variant === 'dark';

  return (
    <div
      aria-label={label}
      className={styles.btnWrapper}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <div className={isDark ? styles.circleDark : styles.circleLight}>
        {AuthIcons(provider, 22)}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner} />
          </div>
        )}
      </div>
      <span className={isDark ? styles.labelDark : styles.labelLight}>{label}</span>
    </div>
  );
});

CircleButton.displayName = 'CircleButton';

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
const SocialButtonGrid = memo<SocialButtonGridProps>(
  ({
    darkRowProviders = DEFAULT_DARK_ROW,
    lightRowProviders = DEFAULT_LIGHT_ROW,
    socialLoading,
    onSocialSignIn,
  }) => {
    const renderRow = (providers: string[], variant: 'dark' | 'light') =>
      providers.map((provider) => (
        <CircleButton
          isLoading={socialLoading === provider}
          key={provider}
          label={toShortName(provider)}
          provider={provider}
          variant={variant}
          onClick={() => onSocialSignIn(provider)}
        />
      ));

    return (
      <div className={styles.gridContainer}>
        {/* ── Row 1 — dark background ── */}
        <div className={`${styles.row} ${styles.rowDark}`}>{renderRow(darkRowProviders, 'dark')}</div>

        {/* ── Row 2 — light background ── */}
        <div className={`${styles.row} ${styles.rowLight}`}>
          {renderRow(lightRowProviders, 'light')}
        </div>
      </div>
    );
  },
);

SocialButtonGrid.displayName = 'SocialButtonGrid';

export default SocialButtonGrid;
