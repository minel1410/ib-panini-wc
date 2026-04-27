'use client';

import { useState } from 'react';
import { registerUser, loginUser } from '../api';
import type { User } from '../types';

type Props = {
  onUserCreated: (user: User) => void;
  playing: boolean;
  onTogglePlay: () => void;
};

type Mode = 'login' | 'register';

const PLAYERS: { number: number; name: string; top?: string; bottom?: string; left?: string; right?: string }[] = [
  { number: 1,  name: 'Vasilj',          top: '8%',    left: '22%'  },
  { number: 7,  name: 'Dedić',           top: '8%',    left: '55%'  },
  { number: 18, name: 'Katić',           top: '14%',   right: '12%' },
  { number: 6,  name: 'Radeljić',        top: '12%',   right: '28%' },
  { number: 4,  name: 'Muharemović',     top: '30%',   right: '10%' },
  { number: 5,  name: 'Kolašinac',       top: '46%',   right: '10%' },
  { number: 20, name: 'Bajraktarević',   top: '62%',   right: '10%' },
  { number: 13, name: 'Bašić',           top: '76%',   right: '14%' },
  { number: 14, name: 'Šunjić',          bottom: '10%',right: '22%' },
  { number: 15, name: 'Memić',           bottom: '8%', left: '42%'  },
  { number: 10, name: 'Demirović',       bottom: '10%',left: '22%'  },
  { number: 11, name: 'Džeko',           bottom: '14%',left: '10%'  },
  { number: 23, name: 'Tabaković',       top: '74%',   left: '10%'  },
  { number: 19, name: 'Alajbegović',     top: '60%',   left: '10%'  },
  { number: 16, name: 'Hadžiahmetović',  top: '46%',   left: '8%'   },
  { number: 17, name: 'Burnić',          top: '30%',   left: '10%'  },
  { number: 12, name: 'Hadžikić',        top: '18%',   left: '10%'  },
  { number: 22, name: 'Zlomislić',       top: '10%',   left: '38%'  },
];

const DECORATIONS = [
  { top: '7%',  left: '6%',   size: 30, color: '#ffd700', shape: 'star' },
  { top: '8%',  right: '8%',  size: 30, color: '#ffd700', shape: 'star' },
  { top: '22%', left: '10%',  size: 10, color: '#7dd3e8', shape: 'plus' },
  { top: '17%', left: '33%',  size: 8,  color: '#ffd700', shape: 'square' },
  { top: '14%', right: '29%', size: 8,  color: '#ffd700', shape: 'square' },
  { top: '38%', left: '4%',   size: 9,  color: '#7dd3e8', shape: 'plus' },
  { top: '55%', left: '5%',   size: 8,  color: '#ffd700', shape: 'square' },
  { top: '70%', left: '7%',   size: 10, color: '#ffd700', shape: 'plus' },
  { top: '78%', right: '7%',  size: 14, color: '#ffd700', shape: 'plus' },
  { top: '88%', left: '22%',  size: 8,  color: '#ffd700', shape: 'square' },
  { top: '91%', right: '18%', size: 8,  color: '#7dd3e8', shape: 'square' },
  { bottom: '5%', right: '4%', size: 20, color: '#e8f0ff', shape: 'diamond' },
  { top: '45%', right: '5%',  size: 9,  color: '#7dd3e8', shape: 'plus' },
  { top: '30%', right: '4%',  size: 8,  color: '#ffd700', shape: 'square' },
] as const;

function PixelDecor({ size, color, shape, delay = 0 }: { size: number; color: string; shape: string; delay?: number }) {
  const anim = `star-pulse ${1.8 + delay * 0.3}s ease-in-out ${delay * 0.4}s infinite`;

  if (shape === 'star') {
    const s = size / 3;
    return (
      <div style={{ width: size, height: size, position: 'relative', animation: anim }}>
        <div style={{
          width: s, height: s,
          background: color,
          position: 'absolute', top: '33%', left: '33%',
          boxShadow: [
            `0 ${-s * 2}px 0 ${color}`,
            `0 ${s * 2}px 0 ${color}`,
            `${-s * 2}px 0 0 ${color}`,
            `${s * 2}px 0 0 ${color}`,
            `0 0 ${size * 0.7}px 3px ${color}55`,
          ].join(', '),
        }} />
      </div>
    );
  }
  if (shape === 'plus') {
    const t = size / 3;
    return (
      <div style={{ width: size, height: size, position: 'relative', opacity: 0.75, animation: anim }}>
        <div style={{ position: 'absolute', width: t, height: size, background: color, left: t, top: 0 }} />
        <div style={{ position: 'absolute', width: size, height: t, background: color, top: t, left: 0 }} />
      </div>
    );
  }
  if (shape === 'diamond') {
    return (
      <div style={{ width: size, height: size, background: color, transform: 'rotate(45deg)', opacity: 0.65, animation: anim }} />
    );
  }
  return <div style={{ width: size, height: size, background: color, opacity: 0.75, animation: anim }} />;
}

export function UserSetup({ onUserCreated, playing, onTogglePlay }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<'name' | 'pw' | 'cpw' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const fn = mode === 'register' ? registerUser : loginUser;
      const user = await fn(name.trim(), password.trim());
      onUserCreated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to server.');
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setConfirmPassword('');
  };

  const inputStyle = (field: 'name' | 'pw' | 'cpw'): React.CSSProperties => ({
    width: '100%',
    padding: '13px 16px',
    fontSize: 16,
    fontFamily: "'Courier New', monospace",
    background: 'rgba(255,255,255,0.04)',
    border: `2px solid ${focused === field ? '#ffd700' : 'rgba(125, 211, 232, 0.3)'}`,
    borderRadius: 3,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#e8f4f8',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focused === field ? '0 0 12px rgba(255,215,0,0.2)' : 'none',
    letterSpacing: 1,
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: '#7dd3e8',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  };

  const isDisabled = loading || !name.trim() || !password.trim() || (mode === 'register' && !confirmPassword.trim());

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0d1929',
        backgroundImage: [
          'linear-gradient(rgba(45,190,190,0.13) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(45,190,190,0.13) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '46px 46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Courier New', Courier, monospace",
        overflow: 'hidden',
      }}
    >
      {DECORATIONS.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 'top' in d ? d.top : undefined,
            bottom: 'bottom' in d ? d.bottom : undefined,
            left: 'left' in d ? d.left : undefined,
            right: 'right' in d ? d.right : undefined,
          }}
        >
          <PixelDecor size={d.size} color={d.color} shape={d.shape} delay={i} />
        </div>
      ))}

      {PLAYERS.map((p, i) => (
        <div
          key={`player-${p.number}`}
          style={{
            position: 'absolute',
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: i % 2 === 0 ? '#ffd700' : '#7dd3e8',
            opacity: 0.55,
            whiteSpace: 'nowrap',
            animation: `star-pulse ${1.6 + i * 0.25}s ease-in-out ${i * 0.35}s infinite`,
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          #{p.number} {p.name}
        </div>
      ))}

      <div style={{ position: 'relative' }}>
        {/* Anthem left */}
        <div style={{
          position: 'absolute',
          right: 'calc(100% + 72px)',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: "'Dancing Script', cursive",
          textAlign: 'right',
          pointerEvents: 'none',
          lineHeight: 2.1,
          whiteSpace: 'nowrap',
        }}>
          {['Zemljo tisućljetna', 'Na vjernost ti se kunem', 'Od mora do Save', 'Od Drine do Une',
            'Jedna si jedina', 'Moja domovina', 'Jedna si jedina', 'Bosna i Hercegovina',
          ].map((line, i) => (
            <div key={i} style={{
              fontSize: i >= 4 ? 30 : 24,
              fontWeight: i >= 4 ? 700 : 500,
              color: i >= 4 ? 'rgba(255,215,0,0.75)' : 'rgba(125,211,232,0.55)',
              opacity: 0,
              animation: `hymn-line-in 0.9s ease forwards`,
              animationDelay: `${i * 0.9}s`,
            }}>{line}</div>
          ))}
        </div>

        {/* Anthem right */}
        <div style={{
          position: 'absolute',
          left: 'calc(100% + 72px)',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: "'Dancing Script', cursive",
          textAlign: 'left',
          pointerEvents: 'none',
          lineHeight: 2.1,
          whiteSpace: 'nowrap',
        }}>
          {["Bog nek' te sačuva", 'Za pokoljenja nova', 'Zemljo mojih snova', 'Mojih pradjedova',
            'Jedna si jedina', 'Moja domovina', 'Jedna si jedina', 'Bosna i Hercegovina',
          ].map((line, i) => (
            <div key={i} style={{
              fontSize: i >= 4 ? 30 : 24,
              fontWeight: i >= 4 ? 700 : 500,
              color: i >= 4 ? 'rgba(255,215,0,0.75)' : 'rgba(125,211,232,0.55)',
              opacity: 0,
              animation: `hymn-line-in 0.9s ease forwards`,
              animationDelay: `${i * 0.9 + 0.4}s`,
            }}>{line}</div>
          ))}
        </div>

        {/* Auth card */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: 460,
            background: 'rgba(10, 20, 42, 0.92)',
            border: '2px solid rgba(255, 215, 0, 0.35)',
            borderRadius: 4,
            padding: '52px 48px 44px',
            boxShadow: [
              '0 0 0 1px rgba(255,215,0,0.08)',
              '0 0 40px rgba(255,215,0,0.12)',
              '0 0 80px rgba(0,0,0,0.6)',
              'inset 0 1px 0 rgba(255,215,0,0.1)',
            ].join(', '),
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, transparent, #ffd700, transparent)',
            borderRadius: '4px 4px 0 0',
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              marginBottom: 12,
              display: 'inline-block',
              animation: 'fleur-glow 2.4s ease-in-out infinite',
            }}>
              <img src="/grb-bih.svg" alt="Grb BiH" width={86} height={106} style={{ display: 'block' }} />
            </div>
            <h1 style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: '#ffd700',
              letterSpacing: 2,
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(255,215,0,0.5)',
              fontFamily: "'Courier New', monospace",
            }}>
              INFOBIP PANINI WC 2026
            </h1>
            <p style={{
              margin: '8px 0 0',
              color: '#7dd3e8',
              fontSize: 13,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              opacity: 0.8,
            }}>
              STICKER TRADING
            </p>
          </div>

          {/* Login / Register toggle */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { if (m !== mode) switchMode(); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  fontFamily: "'Courier New', monospace",
                  cursor: 'pointer',
                  border: 'none',
                  borderBottom: mode === m ? '2px solid #ffd700' : '2px solid rgba(125,211,232,0.15)',
                  background: mode === m ? 'rgba(255,215,0,0.06)' : 'transparent',
                  color: mode === m ? '#ffd700' : '#5a7a9a',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'login' ? 'LOGIN' : 'REGISTER'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <label style={{ ...labelStyle, marginTop: 0 }}>USERNAME</label>
            <input
              type="text"
              placeholder="e.g. Sergej Barbarez"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              style={inputStyle('name')}
            />

            <label style={labelStyle}>PASSWORD</label>
            <input
              type="password"
              placeholder={mode === 'register' ? 'Min. 4 characters' : 'Enter password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('pw')}
              onBlur={() => setFocused(null)}
              style={inputStyle('pw')}
            />

            {mode === 'register' && (
              <>
                <label style={labelStyle}>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocused('cpw')}
                  onBlur={() => setFocused(null)}
                  style={inputStyle('cpw')}
                />
              </>
            )}

            {error && (
              <p style={{ color: '#ff6b6b', fontSize: 11, margin: '12px 0 0', lineHeight: 1.5, letterSpacing: 0.5 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              style={{
                width: '100%',
                marginTop: 20,
                padding: '15px',
                background: isDisabled
                  ? 'rgba(255,215,0,0.12)'
                  : 'linear-gradient(135deg, #b8860b, #ffd700, #b8860b)',
                color: isDisabled ? 'rgba(255,215,0,0.35)' : '#0d1929',
                border: '2px solid rgba(255,215,0,0.5)',
                borderRadius: 3,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Courier New', monospace",
                letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: !isDisabled ? '0 0 16px rgba(255,215,0,0.3)' : 'none',
              }}
            >
              {loading ? '[ CONNECTING... ]' : mode === 'login' ? '[ LOGIN ]' : '[ CREATE ACCOUNT ]'}
            </button>
          </form>

          {/* Switch prompt */}
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#5a7a9a' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#7dd3e8',
                cursor: 'pointer',
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'underline',
                letterSpacing: 1,
              }}
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </div>
        </div>

        {/* Music button */}
        <button
          onClick={onTogglePlay}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '12px 16px',
            background: playing ? 'rgba(255,215,0,0.08)' : 'transparent',
            border: `1px solid ${playing ? 'rgba(255,215,0,0.5)' : 'rgba(125,211,232,0.25)'}`,
            borderRadius: 4,
            color: playing ? '#ffd700' : 'rgba(125,211,232,0.6)',
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            cursor: 'pointer',
            textTransform: 'uppercase',
            boxShadow: playing ? '0 0 16px rgba(255,215,0,0.15)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {playing ? '🎵 ♩ ♪ POLJEM SE ŠIRI MIRIS LJILJANA ♪ ♩ 🎵' : '🎵 PLAY · POLJEM SE ŠIRI MIRIS LJILJANA · 🎵'}
        </button>
      </div>
    </div>
  );
}
