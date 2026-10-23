import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { EPISODE_PRICE, FREE_EPISODES } from '../data/catalog';

const START_COINS = 100;

// Enforced server-side in production, together with the reward callback.
export const AD_UNLOCKS_PER_DAY = 5;

type Progress = { seriesId: string; episode: number };

type Wallet = {
  coins: number;
  vip: boolean;
  adUnlocksLeft: number;
  autoUnlock: boolean;
  lastWatched: Progress | null;
  isUnlocked: (seriesId: string, episode: number) => boolean;
  unlockWithCoins: (seriesId: string, episode: number) => boolean;
  unlockSeason: (seriesId: string, price: number) => boolean;
  unlockWithAd: (seriesId: string, episode: number) => boolean;
  refund: (seriesId: string, episode: number) => void;
  addCoins: (amount: number) => void;
  subscribe: () => void;
  setAutoUnlock: (on: boolean) => void;
  setLastWatched: (p: Progress) => void;
  reset: () => void;
};

const WalletContext = createContext<Wallet | null>(null);

const key = (seriesId: string, episode: number) => `${seriesId}#${episode}`;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(START_COINS);
  const [vip, setVip] = useState(false);
  const [adUnlocksLeft, setAdUnlocksLeft] = useState(AD_UNLOCKS_PER_DAY);
  const [autoUnlock, setAutoUnlock] = useState(false);
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
    (seriesId: string, price: number) => {
      if (coins < price) return false;
      setCoins((c) => c - price);
      setSeasons((prev) => new Set(prev).add(seriesId));
      return true;
    },
    [coins],
  );

  const unlockWithAd = useCallback(
    (seriesId: string, episode: number) => {
      if (adUnlocksLeft <= 0) return false;
      setAdUnlocksLeft((n) => n - 1);
      grant(seriesId, episode);
      return true;
    },
    [adUnlocksLeft, grant],
  );

  const refund = useCallback((seriesId: string, episode: number) => {
    setCoins((c) => c + EPISODE_PRICE);
    setEpisodes((prev) => {
      const next = new Set(prev);
      next.delete(key(seriesId, episode));
      return next;
    });
  }, []);

  const value = useMemo<Wallet>(
    () => ({
      coins,
      vip,
      adUnlocksLeft,
      autoUnlock,
      lastWatched,
      isUnlocked,
      unlockWithCoins,
      unlockSeason,
      unlockWithAd,
      refund,
      addCoins: (amount) => setCoins((c) => c + amount),
      subscribe: () => setVip(true),
      setAutoUnlock,
      setLastWatched,
      reset: () => {
        setCoins(START_COINS);
        setVip(false);
        setAdUnlocksLeft(AD_UNLOCKS_PER_DAY);
        setAutoUnlock(false);
        setEpisodes(new Set());
        setSeasons(new Set());
        setLastWatched(null);
      },
    }),
    [coins, vip, adUnlocksLeft, autoUnlock, lastWatched, isUnlocked, unlockWithCoins, unlockSeason, unlockWithAd, refund],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
