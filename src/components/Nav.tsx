'use client';

import type { User } from '../types';

type Route = 'album' | 'duplicates' | 'matches' | 'lookup' | 'leaderboard' | 'admin';

type Props = {
  user: User;
  onLogout: () => void;
  playing: boolean;
  onTogglePlay: () => void;
  route: Route;
  onNavigate: (r: Route) => void;
};

const MONO = "'Courier New', Courier, monospace";

const NAV_ITEMS: { route: Route; label: string; admin?: boolean }[] = [
  { route: 'album', label: 'My Album' },
  { route: 'duplicates', label: 'Duplicates' },
  { route: 'matches', label: 'Matches' },
  { route: 'lookup', label: 'Lookup' },
  { route: 'leaderboard', label: 'Leaderboard' },
  { route: 'admin', label: '⚙ Admin', admin: true },
];

export function Nav({ user, onLogout, playing, onTogglePlay, route, onNavigate }: Props) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      padding: '0 28px',
      height: 56,
      background: '#0d1f3a',
      borderBottom: '2px solid rgba(255,215,0,0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      fontFamily: MONO,
    }}>
      <img src="/grb-bih.svg" alt="Grb BiH" height={36} style={{ marginRight: 8, filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.5))' }} />
      <span style={{
        fontWeight: 700,
        fontSize: 12,
        color: '#ffd700',
        marginRight: 24,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadow: '0 0 16px rgba(255,215,0,0.5)',
        whiteSpace: 'nowrap',
      }}>
        Infobip Panini WC 2026
      </span>

      {NAV_ITEMS.map(item => {
        if (item.admin && user.name !== 'Ismail') return null;
        const isActive = route === item.route;
        return (
          <button
            key={item.route}
            onClick={() => onNavigate(item.route)}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              background: isActive ? 'rgba(255,215,0,0.1)' : 'transparent',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              fontFamily: MONO,
              color: isActive ? '#ffd700' : '#7dd3e8',
              borderBottom: isActive ? '2px solid #ffd700' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {item.label}
          </button>
        );
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 13, color: '#f0f8ff', letterSpacing: 1, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 4, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 15 }}>👤</span>
          <strong style={{ color: '#ffd700', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{user.name}</strong>
        </span>
        <button onClick={onTogglePlay} style={{
          padding: '6px 14px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: playing ? '#ffd700' : 'rgba(125,211,232,0.5)',
          background: playing ? 'rgba(255,215,0,0.1)' : 'transparent',
          border: `1px solid ${playing ? 'rgba(255,215,0,0.4)' : 'rgba(125,211,232,0.2)'}`,
          borderRadius: 4,
          cursor: 'pointer',
          fontFamily: MONO,
          transition: 'all 0.2s',
          boxShadow: playing ? '0 0 10px rgba(255,215,0,0.15)' : 'none',
        }}>
          {playing ? '🎵 ON' : '🎵 OFF'}
        </button>
        <button onClick={onLogout} style={{
          padding: '6px 14px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#7dd3e8',
          background: 'rgba(125,211,232,0.08)',
          border: '1px solid rgba(125,211,232,0.35)',
          borderRadius: 4,
          cursor: 'pointer',
          fontFamily: MONO,
          transition: 'all 0.15s',
        }}>
          Switch User
        </button>
      </div>
    </nav>
  );
}
