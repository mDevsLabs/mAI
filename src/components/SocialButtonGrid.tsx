'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import AuthIcons from '@/components/AuthIcons';

// ─────────────────────────────────────────────────────────────
// Static styles — zero runtime (createStaticStyles + cssVar.*)
// ─────────────────────────────────────────────────────────────
const useStyles = createStaticStyles(({ css, cssVar }) => ({
  // ── Shared row wrapper ──────────────────────────────────────
  row: css`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    padding: 18px 16px;
    border-radius: 16px;
  `,

  // ── Dark row (ligne 1) ──────────────────────────────────────
  rowDark: css`
    background: #0a0a0a;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 4px 24px rgba(0, 0, 0, 0.35);
  `,

  // ── Light row (ligne 2) ─────────────────────────────────────
  rowLight: css`
    background: #ffffff;
    border: 1px solid ${cssVar.colorBorderSecondary};
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  `,

  // ── Individual button wrapper ───────────────────────────────
  btnWrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    flex: 1;
    min-width: 0;
    user-select: none;

    &:hover .social-circle {
      transform: translateY(-3px) scale(1.07);
    }

    &:active .social-circle {
      transform: translateY(0) scale(0.97);
    }
  `,

  // ── Circle — dark variant ───────────────────────────────────
  circleDark: css`
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.2s ease, background 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(
        circle at 35% 30%,
        rgba(255, 255, 255, 0.08) 0%,
        transparent 70%
      );
      pointer-events: none;
    }

    &:hover {
      background: #242424;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55),
        0 0 0 1px rgba(255, 255, 255, 0.18);
    }
  `,

  // ── Circle — light variant ──────────────────────────────────
  circleLight: css`
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: #f8f8f8;
    border: 1px solid ${cssVar.colorBorderSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.2s ease, background 0.2s ease;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(
        circle at 35% 25%,
        rgba(255, 255, 255, 0.9) 0%,
        transparent 65%
      );
      pointer-events: none;
    }

    &:hover {
      background: #ffffff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12),
        0 0 0 1px ${cssVar.colorBorder};
    }
  `,

  // ── Provider label below circle ─────────────────────────────
  labelDark: css`
    font-size: 10px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    letter-spacing: 0.01em;
    transition: color 0.2s ease;

    .social-btn-wrapper:hover & {
      color: rgba(255, 255, 255, 0.9);
    }
  `,

  labelLight: css`
    font-size: 10px;
    font-weight: 500;
    color: ${cssVar.colorTextTertiary};
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    letter-spacing: 0.01em;
    transition: color 0.2s ease;

    .social-btn-wrapper:hover & {
      color: ${cssVar.colorText};
    }
  `,

  // ── Loading spinner overlay ─────────────────────────────────
  loadingOverlay: css`
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(2px);
  `,

  loadingSpinner: css`
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.25);
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
// Helper: turn 'my-provider' → 'My Provider'
// ─────────────────────────────────────────────────────────────
const toDisplayName = (id: string) =>
  id.toLowerCase().replaceAll(/(^|[_-])([a-z])/g, (_, __, c: string) => c.toUpperCase());

// ─────────────────────────────────────────────────────────────
// Single circular button
// ─────────────────────────────────────────────────────────────
interface CircleButtonProps {
  provider: string;
  variant: 'dark' | 'light';
  isLoading: boolean;
  label: string;
  styles: ReturnType<typeof useStyles>;
  onClick: () => void;
}

const CircleButton = memo<CircleButtonProps>(
  ({ provider, variant, isLoading, label, styles: s, onClick }) => {
    const isDark = variant === 'dark';

    return (
      <div
        aria-label={label}
        className={`${s.btnWrapper} social-btn-wrapper`}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClick();
        }}
      >
        <div
          className={`social-circle ${isDark ? s.circleDark : s.circleLight}`}
          style={{ position: 'relative' }}
        >
          {AuthIcons(provider, 24)}
          {isLoading && (
            <div className={s.loadingOverlay}>
              <div className={s.loadingSpinner} />
            </div>
          )}
        </div>
        <span className={isDark ? s.labelDark : s.labelLight}>{label}</span>
      </div>
    );
  },
);

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
    const { t } = useTranslation('auth');
    const s = useStyles();

    const getLabel = (provider: string) => {
      const normalized = toDisplayName(provider);
      const key = normalized.replaceAll(/[^a-z\d]/gi, '');
      return t(`betterAuth.signin.continueWith${key}`, {
        defaultValue: normalized,
      });
    };

    const renderRow = (providers: string[], variant: 'dark' | 'light') =>
      providers.map((provider) => (
        <CircleButton
          isLoading={socialLoading === provider}
          key={provider}
          label={getLabel(provider)}
          provider={provider}
          styles={s}
          variant={variant}
          onClick={() => onSocialSignIn(provider)}
        />
      ));

    return (
      <Flexbox gap={10}>
        {/* ── Row 1 — dark background ── */}
        <div className={`${s.row} ${s.rowDark}`}>{renderRow(darkRowProviders, 'dark')}</div>

        {/* ── Row 2 — light background ── */}
        <div className={`${s.row} ${s.rowLight}`}>{renderRow(lightRowProviders, 'light')}</div>
      </Flexbox>
    );
  },
);

SocialButtonGrid.displayName = 'SocialButtonGrid';

export default SocialButtonGrid;
