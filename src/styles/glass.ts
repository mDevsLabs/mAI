import { createStaticStyles } from 'antd-style';

export const glassStyles = createStaticStyles(({ css, cssVar }) => ({
  surface: css`
    border: 1px solid color-mix(in srgb, ${cssVar.colorBorderSecondary} 68%, transparent);
    background: color-mix(in srgb, ${cssVar.colorBgElevated} 82%, transparent);
    box-shadow: ${cssVar.boxShadowSecondary};
    backdrop-filter: blur(18px) saturate(1.35);
    -webkit-backdrop-filter: blur(18px) saturate(1.35);

    @supports not (backdrop-filter: blur(1px)) {
      background: ${cssVar.colorBgElevated};
    }
  `,
  surfaceInteractive: css`
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease,
      background 160ms ease,
      transform 160ms ease;

    &:hover {
      border-color: color-mix(in srgb, ${cssVar.colorPrimary} 42%, transparent);
      box-shadow: ${cssVar.boxShadowTertiary};
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  `,
  surfaceStrong: css`
    border: 1px solid color-mix(in srgb, ${cssVar.colorBorderSecondary} 76%, transparent);
    background: color-mix(in srgb, ${cssVar.colorBgElevated} 90%, transparent);
    box-shadow: ${cssVar.boxShadowTertiary};
    backdrop-filter: blur(22px) saturate(1.4);
    -webkit-backdrop-filter: blur(22px) saturate(1.4);

    @supports not (backdrop-filter: blur(1px)) {
      background: ${cssVar.colorBgElevated};
    }
  `,
}));
