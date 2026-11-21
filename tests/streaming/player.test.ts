import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StreamingVideoPlayer } from "../../components/VideoPlayer";
import type { StreamSource } from "../../lib/streaming/types";

test("player binds an authorized direct source and optional subtitle track", () => {
  const source: StreamSource = {
    id: "owned-mp4",
    providerId: "owned-library",
    providerName: "Owned media library",
    title: "Authorized movie",
    url: "https://media.example.test/authorized.mp4",
    kind: "mp4",
    quality: "1080p",
    subtitles: [{ url: "https://media.example.test/subtitles/en.vtt", language: "en", label: "English", isDefault: true }],
  };
  const markup = renderToStaticMarkup(createElement(StreamingVideoPlayer, { source, title: "Authorized movie" }));
  assert.match(markup, /<video[^>]*controls/);
  assert.match(markup, /src="https:\/\/media\.example\.test\/authorized\.mp4"/);
  assert.match(markup, /data-stream-kind="mp4"/);
  assert.match(markup, /kind="subtitles"/);
});

test("provider-owned iframe sources are refused unless explicitly identified", () => {
  const source: StreamSource = {
    id: "embed",
    providerId: "owned-library",
    providerName: "Owned media library",
    title: "Authorized movie",
    url: "https://player.example.test/embed/123",
    kind: "iframe",
  };
  const markup = renderToStaticMarkup(createElement(StreamingVideoPlayer, { source, title: "Authorized movie" }));
  assert.match(markup, /did not identify its iframe as an authorized provider-owned player/);
  assert.doesNotMatch(markup, /<iframe/);
});

test("player binds HLS and DASH source kinds for their browser playback adapters", () => {
  for (const kind of ["hls", "dash"] as const) {
    const source: StreamSource = {
      id: `owned-${kind}`,
      providerId: "owned-library",
      providerName: "Owned media library",
      title: "Authorized episode",
      url: `https://media.example.test/episode.${kind === "hls" ? "m3u8" : "mpd"}`,
      kind,
    };
    const markup = renderToStaticMarkup(createElement(StreamingVideoPlayer, { source, title: "Authorized episode" }));
    assert.match(markup, new RegExp(`data-stream-kind="${kind}"`));
    assert.match(markup, /<video[^>]*controls/);
  }
});
