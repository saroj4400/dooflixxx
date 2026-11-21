import assert from "node:assert/strict";
import test from "node:test";
import { resolveAuthorizedRedirect } from "../../lib/streaming/resolver";

test("accepts a public allowlisted MP4 with a video MIME response", async () => {
  const fetcher: typeof fetch = async () => new Response(null, {
    status: 200,
    headers: { "Content-Type": "video/mp4" },
  });
  const result = await resolveAuthorizedRedirect(
    "https://media.example.test/movie",
    ["media.example.test"],
    fetcher,
  );
  assert.deepEqual(result, { url: "https://media.example.test/movie", kind: "mp4" });
});

test("recognizes validated HLS, DASH, and WebM media MIME types", async () => {
  const cases = [
    ["application/x-mpegURL", "hls"],
    ["application/dash+xml", "dash"],
    ["video/webm", "webm"],
  ] as const;
  for (const [contentType, kind] of cases) {
    const fetcher: typeof fetch = async () => new Response(null, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
    const result = await resolveAuthorizedRedirect(
      "https://media.example.test/content",
      ["media.example.test"],
      fetcher,
    );
    assert.deepEqual(result, { url: "https://media.example.test/content", kind });
  }
});

test("follows only allowlisted HTTPS redirects and derives HLS from MIME", async () => {
  const seen: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    seen.push(url);
    if (url === "https://origin.example.test/watch") {
      return new Response(null, { status: 302, headers: { Location: "https://cdn.example.test/playlist" } });
    }
    return new Response(null, { status: 200, headers: { "Content-Type": "application/vnd.apple.mpegurl" } });
  };
  const result = await resolveAuthorizedRedirect(
    "https://origin.example.test/watch",
    ["origin.example.test", "cdn.example.test"],
    fetcher,
  );
  assert.deepEqual(result, { url: "https://cdn.example.test/playlist", kind: "hls" });
  assert.equal(seen.length, 2);
});

test("rejects redirects outside the provider host allowlist", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls += 1;
    return new Response(null, { status: 302, headers: { Location: "https://other.example.test/video.mp4" } });
  };
  const result = await resolveAuthorizedRedirect("https://origin.example.test/go", ["origin.example.test"], fetcher);
  assert.equal(result, null);
  assert.equal(calls, 1);
});

test("rejects HTML interstitials and private IP literals", async () => {
  const htmlFetcher: typeof fetch = async () => new Response("signin", {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
  assert.equal(await resolveAuthorizedRedirect("https://media.example.test/file", ["media.example.test"], htmlFetcher), null);
  assert.equal(await resolveAuthorizedRedirect("https://127.0.0.1/file.mp4", ["127.0.0.1"], htmlFetcher), null);
});
