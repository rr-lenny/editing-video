import React, { useCallback, useEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { FONTS } from '../config';

type Status = 'loading' | 'ok' | 'error';

/** Carte grise affichée à la place d'une image manquante (le rendu ne plante jamais). */
export const Placeholder: React.FC<{ name?: string; width: number; height?: number }> = ({ name, width, height }) => (
  <div
    style={{
      width,
      height: height ?? width * 0.8,
      borderRadius: 28,
      background: 'repeating-linear-gradient(135deg, #D9D9D5 0 18px, #D2D2CE 18px 36px)',
      border: '4px dashed #9C9C98',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      color: '#6E6E6A',
      fontFamily: FONTS.mono.family,
      fontSize: Math.max(18, width * 0.06),
      textAlign: 'center',
      padding: 20,
      boxSizing: 'border-box',
    }}
  >
    <div style={{ fontSize: Math.max(22, width * 0.09), fontWeight: 700 }}>IMAGE</div>
    <div>{name ?? 'image manquante'}</div>
  </div>
);

interface Props {
  src: string | null | undefined;
  width: number;
  suggestedName?: string;
  style?: React.CSSProperties;
  /** Style appliqué à l'<img> seule (ex. désaturation, sans toucher à l'overlay). */
  imgStyle?: React.CSSProperties;
  /** Rendu supplémentaire superposé quand l'image est chargée (ex. teinte d'accent masquée). */
  overlay?: (url: string) => React.ReactNode;
  /** true = ne rien afficher si l'image manque (particules) au lieu du placeholder. */
  hideOnError?: boolean;
}

/**
 * <img> qui attend son chargement (delayRender) et bascule sur un placeholder en cas d'erreur
 * au lieu de faire échouer le rendu comme le ferait <Img>.
 */
export const SafeImg: React.FC<Props> = ({ src, width, suggestedName, style, imgStyle, overlay, hideOnError }) => {
  const [status, setStatus] = useState<Status>(src ? 'loading' : 'error');
  const [handle] = useState(() => (src ? delayRender(`Chargement de ${src}`) : null));
  const done = useRef(false);
  const ref = useRef<HTMLImageElement>(null);

  const finish = useCallback(
    (s: Status) => {
      if (done.current) return;
      done.current = true;
      setStatus(s);
      if (handle !== null) continueRender(handle);
    },
    [handle],
  );

  useEffect(() => {
    // Image déjà en cache : onLoad peut avoir été émis avant l'hydratation.
    const img = ref.current;
    if (img && img.complete) finish(img.naturalWidth > 0 ? 'ok' : 'error');
  }, [finish]);

  if ((!src || status === 'error') && hideOnError) return null;
  if (!src || status === 'error') return <Placeholder name={suggestedName ?? src ?? undefined} width={width} />;

  const url = staticFile(src);
  return (
    <div style={{ position: 'relative', width, lineHeight: 0, ...style }}>
      <img
        ref={ref}
        src={url}
        alt=""
        style={{ width: '100%', height: 'auto', display: 'block', ...imgStyle }}
        onLoad={() => finish('ok')}
        onError={() => finish('error')}
      />
      {status === 'ok' && overlay ? overlay(url) : null}
    </div>
  );
};
