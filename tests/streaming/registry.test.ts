import assert from "node:assert/strict";
import test from "node:test";
import { ALL_PROVIDER_DETAILS, endpoints } from "../../lib/streaming/providers";
import { getStreamingDiagnostics } from "../../lib/streaming/diagnostics";

test("preserves the merged evidence inventory and reports HDMovie2 as implemented but unverified", async () => {
  assert.equal(endpoints.length, 27);
  assert.equal(ALL_PROVIDER_DETAILS.length, 17);
  assert.ok(endpoints.every((endpoint) => endpoint.method === "UNCONFIRMED"));

  const report = await getStreamingDiagnostics();
  assert.equal(report.providers.length, ALL_PROVIDER_DETAILS.length);
  assert.equal(report.endpointRecords.length, endpoints.length);
  assert.equal(report.providers.filter((provider) => provider.implementationExists).length, 1);
  assert.equal(report.providers.find((provider) => provider.id === "hdmovie2")?.implementationExists, true);
  assert.ok(report.providers.every((provider) => !provider.playableMediaVerified));
  assert.ok(report.providers.every((provider) => provider.testRequestSucceeded === null));
});

test("TMDB probe is optional and never reports metadata as playback", async () => {
  const fakeFetch: typeof fetch = async () => new Response(JSON.stringify({ id: 550 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  const report = await getStreamingDiagnostics({ probe: true, fetcher: fakeFetch, tmdbApiKey: "test-only-key" });
  const tmdb = report.providers.find((provider) => provider.id === "tmdb");
  assert.ok(tmdb);
  assert.equal(tmdb.testRequestSucceeded, true);
  assert.equal(tmdb.playableMediaVerified, false);
});
