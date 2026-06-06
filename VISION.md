# SunoLiveStream

A 24/7 **live YouTube channel where viewers request AI-generated Suno songs and
collectively steer the visuals** — every moment captured so it's watchable later.
This is the productized, Suno-focused fork of the **HyperLive** broadcast engine.

> **Forked from** `hyperlive` @ `b65bbdd`. HyperLive stays the platform/playground
> for discovery; SunoLiveStream is the Suno path. See HyperLive's
> [`docs/platform-directions.md`](docs/platform-directions.md) for the kernel and
> the core/pack seam this is built on.

---

## Relationship to HyperLive (keep this honest)

`hyperlive` is wired as the **upstream** remote. The deal:

- **Pull core fixes down**, don't reinvent them:
  ```bash
  git fetch upstream && git merge upstream/main
  ```
- **Keep the Suno layer thin** so merges stay clean. The platform (capture/encode,
  poll/moderate/probe/quota, the directive bus, votes/mood/reactions) should stay
  byte-for-byte mergeable with upstream.
- **Divergence boundary** — Suno-specific code lives only in:
  - `packages/streamer/src/music/` (DJ, resolve, rotation, intro)
  - the `/music/*` control-plane endpoints
  - the now-playing card + artist credit roll scene widgets
  - `parseSunoShare` / the Suno resolver + CDN allow-list
  - `scene/assets/` (Suno/GitHub logos)

  Resist Suno edits to `streamer/` capture/encode and the `ingest/` core — those
  are pure platform. If you need to touch them, do it upstream and merge down.

When a *third* direction gets real, that's the signal to graduate HyperLive to a
`core/ + packs/` monorepo. Until then, fork-with-upstream is the right cost.

---

## What it inherits (the kernel)

1. Persistent headless HTML/CSS/GSAP scene, 24/7, anti-throttled.
2. Live capture → ffmpeg → YouTube RTMP (CFR pump, reconnect, **CBR** encode).
3. The **safe directive bus** — moderated chat → validated `{action, params}`
   against an allow-list. Viewer input is only ever *arguments*, never code.
4. Collective dynamics — theme votes, Mood Engine, reactions, Super-Chat tiers.

## The Suno pack (what makes this *SunoLiveStream*)

- **Auto-DJ** — resolves Suno share links to playable CDN audio, plays the request
  queue then a house rotation, intro-music loop under the standby screen.
- **Requests** — chat `suno.com/s/<id>` *or* `suno.com/song/<uuid>` → queued.
- **Now-playing card** — title/artist/cover, requester, live EQ, **per-song hearts
  that persist across replays** (keyed by share URL).
- **Stream-like milestones** — YouTube video likes → celebratory shoutouts.
- **Outro credit roll** — every Suno artist played this session + a Made-with-Suno
  rights line + GitHub/Suno logos.
- **Show flow** — intro → 10s on-air countdown → live; `resume`, break/technical/
  outro screens (`scripts/live.sh`).

---

## Roadmap (the Suno path)

**Near term**
- [ ] **Viewer request onboarding** — viewers (not just the owner) need
      moderator/verified status to post links in live chat. Add an in-scene
      "how to request a song" card + a one-time "made you a mod" flow / pinned
      instructions. *(This was the single biggest live-ops surprise.)*
- [ ] **Request fairness** — per-user cooldown, queue cap polish, dedup, maybe a
      max per artist so one requester can't monopolize.
- [ ] **README rebrand** — the inherited `README.md` still describes HyperLive;
      rewrite for SunoLiveStream (keep a "powered by HyperLive" credit).

**Mid term**
- [ ] **Super-Chat → escalating effects + HyperFrames takeover clips** — the large
      tier reserves a pre-rendered clip slot (Phase 3, pending). Cross-pollinate
      with `suno-video-generator` for the clips.
- [ ] **Discovery segments** — "tonight's most-hearted" using persisted hearts; a
      trending/top-tracks interstitial.
- [ ] **House-rotation curation** — a small UI/file flow to manage the rotation;
      possibly source from `SunoPlaylistPlayer`.

**Hardening (Phase 4)**
- [ ] 1080p60 path, watchdog, kill-switch dashboard (`packages/dashboard`).
- [ ] Rights/credits polish — per-artist attribution, optional link-back to the
      artist's Suno profile, clearer Made-with-Suno framing.

---

## Sibling Suno projects (cross-pollinate)
- `suno-video-generator` → pre-rendered takeover/intro clips.
- `SunoPlaylistPlayer` → house-rotation / playlist source.

---

## Operational playbook (paid for in blood — keep it)
- **Post in the LIVE-CHAT panel**, not the video's comments — only live chat feeds
  the API. Viewer links need **moderator/verified** status (links from
  non-eligible accounts render as plain text and never reach the API).
- **`live.sh build` = container/streamer; `live.sh restart` = host ingest.** Two
  processes — a code fix won't take until the *right* one restarts.
- **iGPU H264 is low-power/CQP-only** here → no hardware bitrate target. Use CPU
  libx264 **CBR** (`HW_ENCODE=false`) for a guaranteed rate / "excellent" quality.
- The **stale-`pageToken` catch-up probe** keeps the 24/7 poller honest across
  broadcast restarts (it returns empty, not an error).
- Display text is **NFKC-folded** so fancy Unicode artist names don't tofu.

## First-run setup (this fork)
```bash
cp ../hyperlive/.env .            # secrets are gitignored; copy or set fresh
# create a SunoLiveStream repo on GitHub, then:
git remote add origin git@github.com:<you>/SunoLiveStream.git
git push -u origin main
scripts/live.sh build && scripts/live.sh start
```
