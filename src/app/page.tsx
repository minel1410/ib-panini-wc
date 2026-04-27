'use client';

import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { UserSetup } from '@/components/UserSetup';
import { useUser } from '@/hooks/useUser';
import { MyAlbum } from '@/views/MyAlbum';
import { Duplicates } from '@/views/Duplicates';
import { Matches } from '@/views/Matches';
import { StickerLookup } from '@/views/StickerLookup';
import { Leaderboard } from '@/views/Leaderboard';
import { Admin } from '@/views/Admin';

type Route = 'album' | 'duplicates' | 'matches' | 'lookup' | 'leaderboard' | 'admin';

export default function Home() {
  const { user, saveUser, clearUser } = useUser();
  const [playing, setPlaying] = useState(false);
  const [route, setRoute] = useState<Route>('album');

  if (!user) {
    return <UserSetup onUserCreated={saveUser} playing={playing} onTogglePlay={() => setPlaying(p => !p)} />;
  }

  return (
    <>
      {playing && (
        <iframe
          style={{ display: 'none' }}
          src="https://www.youtube.com/embed/-_iydz_Aj-A?autoplay=1&loop=1&playlist=-_iydz_Aj-A"
          allow="autoplay"
        />
      )}
      <div
        style={{
          minHeight: '100vh',
          background: '#0a1628',
          backgroundImage: [
            'linear-gradient(rgba(30,53,80,0.8) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(30,53,80,0.8) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '46px 46px',
          fontFamily: "'Courier New', Courier, monospace",
          color: '#f0f8ff',
        }}
      >
        <Nav user={user} onLogout={clearUser} playing={playing} onTogglePlay={() => setPlaying(p => !p)} route={route} onNavigate={setRoute} />
        <main>
          {route === 'album' && <MyAlbum userId={user.id} />}
          {route === 'duplicates' && <Duplicates userId={user.id} />}
          {route === 'matches' && <Matches userId={user.id} />}
          {route === 'lookup' && <StickerLookup />}
          {route === 'leaderboard' && <Leaderboard userId={user.id} />}
          {route === 'admin' && <Admin currentUser={user} />}
        </main>
      </div>
    </>
  );
}
