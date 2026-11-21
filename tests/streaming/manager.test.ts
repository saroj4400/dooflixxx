import assert from "node:assert/strict";
import test from "node:test";
import { discoverStreams } from "../../lib/streaming/manager";
import { getProviderCapabilities, type StreamRequest, type StreamingProvider } from "../../lib/streaming/types";

const mediaResponse: typeof fetch = async () => new Response(null, {
  status: 200,
  headers: { "Content-Type": "video/mp4" },
});

function fixtureProvider(receive: (request: StreamRequest) => void): StreamingProvider {
  return {
    id: "test-authorized-fixture",
    name: "Test fixture provider",
    enabled: true,
    supports: { movie: true, tv: true },
    allowedHosts: ["media.example.test"],
    async getSources(request) {
      receive(request);
      return [{
        id: "fixture-source",
        providerId: "test-authorized-fixture",
        providerName: "Test fixture provider",
        title: "Fixture media",
        url: "https://media.example.test/video",
        kind: "mp4",
        quality: "1080p",
      }];
    },
  };
}

test("movie request reaches the provider and returns only MIME-validated source", async () => {
  let received: StreamRequest | undefined;
  const request: StreamRequest = { tmdbId: "550", mediaType: "movie", title: "Fixture" };
  const result = await discoverStreams(request, [fixtureProvider((value) => { received = value; })], mediaResponse);
  assert.equal(received?.tmdbId, "550");
  assert.equal(received?.mediaType, "movie");
  assert.equal(result.providers[0]?.status, "ok");
  assert.equal(result.sources[0]?.kind, "mp4");
});

test("TV request preserves the exact season and episode through discovery", async () => {
  let received: StreamRequest | undefined;
  const request: StreamRequest = { tmdbId: "1399", mediaType: "tv", title: "Fixture", season: 4, episode: 9 };
  const result = await discoverStreams(request, [fixtureProvider((value) => { received = value; })], mediaResponse);
  assert.deepEqual(received, request);
  assert.equal(result.sources.length, 1);
});

test("disabled providers are not searched and failed media validation returns no source", async () => {
  let called = false;
  const provider = fixtureProvider(() => { called = true; });
  provider.enabled = false;
  const disabled = await discoverStreams({ tmdbId: "550", mediaType: "movie" }, [provider], mediaResponse);
  assert.equal(called, false);
  assert.equal(disabled.sources.length, 0);

  provider.enabled = true;
  const htmlResponse: typeof fetch = async () => new Response("not media", { status: 200, headers: { "Content-Type": "text/html" } });
  const rejected = await discoverStreams({ tmdbId: "550", mediaType: "movie" }, [provider], htmlResponse);
  assert.equal(rejected.sources.length, 0);
  assert.equal(rejected.providers[0]?.status, "empty");
});

test("provider capability detection reports only implemented methods", () => {
  const provider = fixtureProvider(() => {});
  provider.getSources = undefined;
  provider.getMovieStreams = async () => [];
  const capabilities = getProviderCapabilities(provider);
  assert.equal(capabilities.getMovieStreams, true);
  assert.equal(capabilities.getEpisodeStreams, false);
  assert.equal(capabilities.searchMovie, false);
});

test("provider timeout and failures are isolated from other providers", async () => {
  const slow = fixtureProvider(() => {});
  slow.id = "slow";
  slow.name = "Slow provider";
  slow.getSources = async () => new Promise(() => {});
  const broken = fixtureProvider(() => {});
  broken.id = "broken";
  broken.name = "Broken provider";
  broken.getSources = async () => { throw new Error("fixture failure"); };
  const result = await discoverStreams(
    { tmdbId: "550", mediaType: "movie" },
    [slow, broken],
    mediaResponse,
    5,
  );
  assert.deepEqual(result.providers.map(({ status }) => status), ["error", "error"]);
  assert.match(result.providers[0]?.message || "", /timed out/i);
  assert.match(result.providers[1]?.message || "", /fixture failure/);
});

test("duplicate validated source URLs collapse to one result", async () => {
  const first = fixtureProvider(() => {});
  const second = fixtureProvider(() => {});
  second.id = "second";
  second.name = "Second provider";
  second.getSources = async () => [{
    id: "duplicate",
    providerId: second.id,
    providerName: second.name,
    title: "Duplicate fixture media",
    url: "https://media.example.test/video",
    kind: "mp4",
  }];
  const result = await discoverStreams({ tmdbId: "550", mediaType: "movie" }, [first, second], mediaResponse);
  assert.equal(result.sources.length, 1);
});
