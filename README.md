# DramaFlash beta: clickable prototype

Round 2 task (Option A) for the TargetVideo Mobile App Developer role. Built from the screen design you sent, in React Native with Expo.

**Try it:** https://sabuhiteymurov.github.io/dramaflash-prototype/ (works best in a phone-sized window or on a phone)

**Demo video (69 s):** [docs/demo.mp4](docs/demo.mp4)

![Home, player, cliffhanger, unlock sheet, coin store, rewarded ad](docs/overview.jpg)

## What to click

1. **Home.** Spotlight hero, genre chips and poster rows, as in the design.
2. **Series page.** Open any poster, for example *The Billionaire's Secret*. It shows the synopsis, cast, and episode list with lock badges.
3. **Player.** Press *Play Ep 1*. It's a vertical feed: swipe or scroll to change episodes, tap to pause.
   - Episodes 1 to 3 are free and play one after another.
   - When episode 3 ends on its cliffhanger, the feed moves to episode 4. Episode 4 is locked, so the unlock sheet opens on top of it.
4. **Unlock**, three ways:
   - **Coins.** You start with 15 coins, which is enough for one episode at 10.
   - **Coin store.** Try the next locked episode. The sheet sends you to the store, you buy a pack (simulated), come back and unlock.
   - **Rewarded ad.** Pick *Watch a short ad*. After a 5 second countdown the episode unlocks.

After any unlock you land back in the feed and the episode starts playing. *Profile → Reset prototype* puts coins and unlocks back to the start.

## Choices I made

**Stack.**
- Expo SDK 58, React Native 0.88 (New Architecture), TypeScript and Expo Router. It's the same setup I shipped two apps on at Nool.
- Routes are files. The unlock sheet and the rewarded ad are transparent modals over the player. The player stays mounted underneath, so the feed keeps its position and the next episode is already buffered when the sheet closes.

**Playback** (`src/components/EpisodePage.tsx`, `src/app/player/[id].tsx`).
- It's a paged vertical `FlatList`, with one `expo-video` player per page.
- Only the visible page and its two neighbours get a source. The next episode buffers while the current one plays, so a swipe starts without a spinner.
- Locked pages never get a source, so they cost no bandwidth or decoder.
- A poster frame covers each page until the first video frame renders, so the screen is never black.
- On web the app picks VP9 WebM when the browser can decode it, and H.264 MP4 otherwise. Native builds use MP4.

**Cliffhanger and paywall placement.**
- The paywall appears at the moment of highest intent: right after the cliffhanger, with the locked episode already on screen behind the sheet.
- The free option (a rewarded ad) is listed first. The paid options follow:
  - single episode,
  - season marked *Best value*,
  - Premium.

  A viewer who won't pay today still moves on to the next episode, and that's who would otherwise close the app.

**Entitlements** (`src/store/wallet.tsx`). In this prototype a React context holds coins and unlocks. In production the server owns entitlements:
- **Purchases.** The app sends the App Store or Play receipt, the backend validates it (or RevenueCat does), and only then are coins credited.
- **Rewarded ads.** The unlock comes from the ad network's server-side reward callback, not from a client timer, so it can't be faked.

**Content.**
- Posters, cast photos and key art come from your design file.
- The four episode clips are 9-second vertical videos I rendered from the key art with ffmpeg.
- Subtitles are data in `src/data/catalog.ts`, which stands in for the CMS.

## What is mocked

Payments, the ad, login and the CMS. Prices and coin amounts follow the design. *Discover*, *Library* and *Profile* are thin screens so that the tab bar works.

## What I would build next

1. **Playback layer decision.** Prototype `expo-video` against `react-native-video` and your own player wrapped as a native module (Swift/Kotlin). Measure time to first frame and swipe-to-play on a low-end Android phone. HLS with a short first segment, and preload only that segment for the next episode.
2. **Analytics before features.** The events I'd send from day one:
   - `episode_start`, `episode_complete`
   - `paywall_view` (episode, trigger: cliffhanger or tap)
   - `unlock_option_selected`, `unlock_success` (method)
   - `coin_purchase`, `ad_reward_granted`
3. **What I'd watch:**
   - Paywall-to-unlock conversion by method.
   - The share of viewers who start the next episode within 10 seconds of a cliffhanger.
   - Whether free ad unlocks cut into coin revenue.
   - D1 and D7 retention.
4. **Real money.** StoreKit 2 and Play Billing through RevenueCat, with a server webhook and Google IMA for the rewarded ads.

## How it was built

I wrote it in one session and used Claude Code to speed the work up, which is how I build day to day. A Playwright script clicked through the whole unlock flow after every build. That's how the demo video was recorded, and it caught two bugs early: a black frame after an unlock, and the feed losing its scroll position behind a full-screen modal on web.

## Run it

```bash
npm install
npx expo start          # press w for web, or scan with a development build
npm run typecheck
npm run export:web      # static build in dist/, as deployed to GitHub Pages
```

Sabuhi Teymurov · hello@sabuhiteymurov.com
