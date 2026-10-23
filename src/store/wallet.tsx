// Client-side entitlement state for the prototype. In production the server owns entitlements:
// the app sends a store receipt or an ad-network reward callback ID and gets back what it may play.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { EPISODE_PRICE, FREE_EPISODES, SEASON_PRICE } from '../data/catalog';

const START_COINS = 15;

type Progress = { seriesId: string; episode: number };

type Wallet = {
  coins: number;
  vip: boolean;
  lastWatched: Progress | null;
  isUnlocked: (seriesId: string, episode: number) => boolean;
  unlockWithCoins: (seriesId: string, episode: number) => boolean;
  unlockSeason: (seriesId: string) => boolean;
  unlockWithAd: (seriesId: string, episode: number) => void;
  addCoins: (amount: number) => void;
  subscribe: () => void;
  setLastWatched: (p: Progress) => void;
  reset: () => void;
};

const WalletContext = createContext<Wallet | null>(null);

const key = (seriesId: string, episode: number) => `${seriesId}#${episode}`;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(START_COINS);
  const [vip, setVip] = useState(false);
  const [episodes, setEpisodes] = useState<Set<string>>(() => new Set());
  const [seasons, setSeasons] = useState<Set<string>>(() => new Set());
  const [lastWatched, setLastWatched] = useState<Progress | null>(null);

  const isUnlocked = useCallback(
    (seriesId: string, episode: number) =>
      episode <= FREE_EPISODES || vip || seasons.has(seriesId) || episodes.has(key(seriesId, episode)),
    [vip, seasons, episodes],
  );

  const grant = useCallback((seriesId: string, episode: number) => {
    setEpisodes((prev) => new Set(prev).add(key(seriesId, episode)));
  }, []);

  const unlockWithCoins = useCallback(
    (seriesId: string, episode: number) => {
      if (coins < EPISODE_PRICE) return false;
      setCoins((c) => c - EPISODE_PRICE);
      grant(seriesId, episode);
      return true;
    },
    [coins, grant],
  );

  const unlockSeason = useCallback(
    (seriesId: string) => {
      if (coins < SEASON_PRICE) return false;
      setCoins((c) => c - SEASON_PRICE);
      setSeasons((prev) => new Set(prev).add(seriesId));
      return true;
    },
    [coins],
  );

  const value = useMemo<Wallet>(
    () => ({
      coins,
      vip,
      lastWatched,
      isUnlocked,
      unlockWithCoins,
      unlockSeason,
      unlockWithAd: grant,
      addCoins: (amount) => setCoins((c) => c + amount),
      subscribe: () => setVip(true),
      setLastWatched,
      reset: () => {
        setCoins(START_COINS);
        setVip(false);
        setEpisodes(new Set());
        setSeasons(new Set());
        setLastWatched(null);
      },
    }),
    [coins, vip, lastWatched, isUnlocked, unlockWithCoins, unlockSeason, grant],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
