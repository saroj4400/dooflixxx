import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { hdmovie2Provider } from "../../lib/streaming/providers/hdmovie2";
import { discoverStreams } from "../../lib/streaming/manager";

function response(body: string, contentType = "text/html") {
  return new Response(body, { status: 200, headers: { "Content-Type": contentType } });
}

const mediaProbe: typeof fetch = async () => new Response(null, {
  status: 200,
  headers: { "Content-Type": "application/vnd.apple.mpegurl" },
});

test("HDMovie2 movie search, AJAX extraction, and source validation are connected", async () => {
  const originalEnabled = hdmovie2Provider.enabled;
  hdmovie2Provider.enabled = true;
  const requests: Array<{ url: string; method: string; body?: string }> = [];
  const fetchMock = mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    requests.push({ url: url.href, method, body: init?.body ? String(init.body) : undefined });
    if (url.searchParams.has("s")) {
      assert.equal(url.searchParams.get("post_type"), "movies");
      return response('<article><a href="https://hdmovie2a.biz/fixture-movie" title="Fixture Movie">Watch</a><span class="year">2024</span></article>');
    }
    if (url.pathname === "/fixture-movie") {
      return response('<li data-post="42" data-nume="0" data-type="movie"></li>');
    }
    if (url.pathname === "/wp-admin/admin-ajax.php") {
      return response(JSON.stringify({ embed_url: "https://hdmovie2a.biz/video.m3u8" }), "application/json");
    }
    throw new Error(`Unexpected provider request ${url.href}`);
  });

  try {
    const result = await discoverStreams({
      tmdbId: "123",
      mediaType: "movie",
      title: "Fixture Movie",
      year: 2024,
    }, [hdmovie2Provider], mediaProbe);
    assert.equal(result.sources.length, 1);
    assert.equal(result.sources[0]?.kind, "hls");
    assert.equal(result.sources[0]?.url, "https://hdmovie2a.biz/video.m3u8");
    const ajax = requests.find((request) => request.url.includes("admin-ajax.php"));
    assert.equal(ajax?.method, "POST");
    assert.match(ajax?.body || "", /action=doo_player_ajax/);
    assert.match(ajax?.body || "", /post=42/);
    assert.match(ajax?.body || "", /nume=0/);
    assert.match(ajax?.body || "", /type=movie/);
  } finally {
    fetchMock.mock.restore();
    hdmovie2Provider.enabled = originalEnabled;
  }
});

test("HDMovie2 TV extraction requires an exact season and episode marker", async () => {
  const originalEnabled = hdmovie2Provider.enabled;
  hdmovie2Provider.enabled = true;
  let ajaxCalls = 0;
  const fetchMock = mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (url.searchParams.has("s")) {
      assert.equal(url.searchParams.get("post_type"), "tvshows");
      return response('<article><a href="https://hdmovie2a.biz/fixture-show" title="Fixture Show">Watch</a></article>');
    }
    if (url.pathname === "/fixture-show") {
      return response([
        '<li data-post="77" data-nume="2" data-type="tv" data-season="1" data-episode="2"></li>',
        '<li data-post="77" data-nume="7" data-type="tv" data-season="2" data-episode="7"></li>',
      ].join(""));
    }
    if (url.pathname === "/wp-admin/admin-ajax.php") {
      ajaxCalls += 1;
      return response(JSON.stringify({ embed_url: "https://hdmovie2a.biz/s2e7.m3u8" }), "application/json");
    }
    throw new Error(`Unexpected provider request ${url.href}`);
  });
  try {
    const result = await discoverStreams({
      tmdbId: "456",
      mediaType: "tv",
      title: "Fixture Show",
      season: 2,
      episode: 7,
    }, [hdmovie2Provider], mediaProbe);
    assert.equal(ajaxCalls, 1);
    assert.equal(result.sources.length, 1);
    assert.match(result.sources[0]?.title || "", /S2E7/);
  } finally {
    fetchMock.mock.restore();
    hdmovie2Provider.enabled = originalEnabled;
  }
});
