'use client';

import { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../api';
import type { User } from '../types';

type Props = { currentUser: User };

const MONO = "'Courier New', Courier, monospace";
const CARD = { background: '#132340', border: '1px solid #1e3550', borderRadius: 6 } as const;
const ADMIN_NAME = 'Ismail';

export function Admin({ currentUser }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  useEffect(() => {
    getUsers().then(data => { setUsers(data); setLoading(false); });
  }, []);

  if (currentUser.name !== ADMIN_NAME) {
    return (
      <div style={{ padding: 64, textAlign: 'center', fontFamily: MONO }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <div style={{ fontSize: 14, color: '#f87171', letterSpacing: 2, textTransform: 'uppercase' }}>Access denied</div>
      </div>
    );
  }

  const handleDelete = async (user: User) => {
    if (confirm !== user.id) { setConfirm(user.id); return; }
    setDeleting(user.id);
    await deleteUser(user.id);
    setUsers(prev => prev.filter(u => u.id !== user.id));
    setDeleting(null);
    setConfirm(null);
  };

  if (loading) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: '#7dd3e8', fontFamily: MONO, letterSpacing: 2, fontSize: 12 }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px', fontFamily: MONO, maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffd700', letterSpacing: 3, textTransform: 'uppercase' }}>
          ⚙ Admin
        </h2>
        <div style={{ fontSize: 11, color: '#7dd3e8', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>
          {users.length} registered users
        </div>
      </div>

      <div style={{ ...CARD, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px 120px', padding: '12px 18px', borderBottom: '1px solid #1e3550', fontSize: 10, color: '#7dd3e8', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
          <span>Name</span>
          <span>ID</span>
          <span></span>
        </div>

        {users.map((user, idx) => {
          const isMe = user.id === currentUser.id;
          const isConfirming = confirm === user.id;
          const isDeleting = deleting === user.id;

          return (
            <div
              key={user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 260px 120px',
                padding: '14px 18px',
                borderBottom: idx < users.length - 1 ? '1px solid rgba(30,53,80,0.6)' : 'none',
                alignItems: 'center',
                background: isMe ? 'rgba(255,215,0,0.04)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: isMe ? '#ffd700' : '#f0f8ff' }}>
                  {user.name}
                </span>
                {isMe && (
                  <span style={{ fontSize: 9, color: '#ffd700', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 3, padding: '2px 6px', letterSpacing: 1.5 }}>
                    YOU
                  </span>
                )}
              </div>

              <span style={{ fontSize: 10, color: '#5a7a9a', letterSpacing: 1 }}>
                {user.id.slice(0, 8)}...
              </span>

              <div>
                {isMe ? (
                  <span style={{ fontSize: 10, color: '#5a7a9a' }}>—</span>
                ) : (
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={isDeleting}
                    style={{
                      padding: '6px 14px',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      fontFamily: MONO,
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      borderRadius: 4,
                      border: `1px solid ${isConfirming ? '#f87171' : 'rgba(248,113,113,0.3)'}`,
                      background: isConfirming ? 'rgba(248,113,113,0.15)' : 'transparent',
                      color: isConfirming ? '#f87171' : 'rgba(248,113,113,0.6)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isDeleting ? '...' : isConfirming ? 'CONFIRM?' : 'DELETE'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {confirm && (
        <div style={{ marginTop: 12, fontSize: 11, color: '#fbbf24', letterSpacing: 1 }}>
          Klikni ponovo DELETE za potvrdu. Briše se user i svi njegovi stickeri.
        </div>
      )}
    </div>
  );
}
