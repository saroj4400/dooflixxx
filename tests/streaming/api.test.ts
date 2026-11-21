import { NextRequest } from "next/server";
import assert from "node:assert/strict";
import test from "node:test";
import { GET, POST } from "../../app/api/streams/route";

function postRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/streams", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("provider discovery returns the preserved inventory and registered HDMovie2 integration", async () => {
  const request = new NextRequest(
  "http://localhost/api/streams"
);

const response = await GET(request);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.providers.length, 17);
  assert.equal(data.endpointRecords.length, 27);
  assert.deepEqual(data.activePlaybackProviders, []);
});

test("streams API rejects invalid TMDB IDs and media types", async () => {
  const invalidId = await POST(postRequest({ tmdbId: "not-a-tmdb-id", mediaType: "movie" }));
  assert.equal(invalidId.status, 400);
  const invalidType = await POST(postRequest({ tmdbId: "550", mediaType: "episode" }));
  assert.equal(invalidType.status, 400);
});

test("valid movie and TV requests complete discovery without claiming absent playback", async () => {
  const movie = await POST(postRequest({ tmdbId: "550", mediaType: "movie" }));
  const movieData = await movie.json();
  assert.equal(movie.status, 200);
  assert.deepEqual(movieData.sources, []);
  assert.match(movieData.message, /Providers may be disabled/);

  const tv = await POST(postRequest({ tmdbId: "1399", mediaType: "tv", season: 2, episode: 3 }));
  const tvData = await tv.json();
  assert.equal(tv.status, 200);
  assert.deepEqual(tvData.sources, []);
  assert.match(tvData.message, /Providers may be disabled/);
});
