#!/usr/bin/env node

const baseUrl = (process.env.API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const timeoutMs = Number.parseInt(process.env.API_TIMEOUT_MS || "10000", 10);

function createTimeoutSignal(ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timeoutId) };
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function prettyBody(body) {
  if (body === null || body === undefined) return "(empty)";
  if (typeof body === "string") return body.slice(0, 220);
  return JSON.stringify(body).slice(0, 220);
}

async function runCheck(check) {
  const { method = "GET", path, expectedStatus = 200, body, description, validate } = check;
  const url = `${baseUrl}${path}`;
  const { signal, clear } = createTimeoutSignal(timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      signal,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await parseResponseBody(response);
    const statusOk = response.status === expectedStatus;
    const payloadOk = typeof validate === "function" ? validate(data) : true;

    if (statusOk && payloadOk) {
      console.log(`PASS ${method} ${path} (${description}) -> ${response.status}`);
      return { ok: true, data };
    }

    const reason = !statusOk
      ? `expected status ${expectedStatus}, got ${response.status}`
      : "payload validation failed";
    console.error(`FAIL ${method} ${path} (${description}) -> ${reason}`);
    console.error(`Body: ${prettyBody(data)}`);
    return { ok: false, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL ${method} ${path} (${description}) -> request error: ${message}`);
    return { ok: false, data: null };
  } finally {
    clear();
  }
}

function getIdFromCollection(collection) {
  if (!Array.isArray(collection) || collection.length === 0) return null;
  const candidate = collection[0];
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate.id;
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

async function runTests() {
  let failures = 0;
  let skipped = 0;

  console.log(`Running API smoke checks against ${baseUrl}`);
  console.log("");

  const health = await runCheck({
    method: "GET",
    path: "/api/health",
    description: "health endpoint",
    validate: (data) => data && data.status === "ok",
  });
  if (!health.ok) failures++;

  const db = await runCheck({
    method: "GET",
    path: "/api/test-db",
    description: "database connectivity",
    validate: (data) => data && data.status === "ok",
  });
  if (!db.ok) failures++;

  const communityList = await runCheck({
    method: "GET",
    path: "/api/community",
    description: "community list endpoint",
    validate: (data) => Array.isArray(data),
  });
  if (!communityList.ok) failures++;

  const blogPosts = await runCheck({
    method: "GET",
    path: "/api/blog/posts?limit=3",
    description: "blog list endpoint",
    validate: (data) => Array.isArray(data),
  });
  if (!blogPosts.ok) failures++;

  const stories = await runCheck({
    method: "GET",
    path: "/api/stories?limit=3",
    description: "stories endpoint",
    validate: (data) => data && data.success === true && Array.isArray(data.data),
  });
  if (!stories.ok) failures++;

  const featuredStories = await runCheck({
    method: "GET",
    path: "/api/stories/featured?limit=2",
    description: "featured stories endpoint",
    validate: (data) => data && data.success === true && Array.isArray(data.data),
  });
  if (!featuredStories.ok) failures++;

  const badges = await runCheck({
    method: "GET",
    path: "/api/badges",
    description: "badges endpoint",
    validate: (data) => Array.isArray(data),
  });
  if (!badges.ok) failures++;

  const leaderboard = await runCheck({
    method: "GET",
    path: "/api/leaderboard?type=global&limit=5",
    description: "leaderboard endpoint",
    validate: (data) => data && data.success === true && Array.isArray(data.data),
  });
  if (!leaderboard.ok) failures++;

  const communityPostId = getIdFromCollection(communityList.data);
  if (communityPostId === null) {
    skipped++;
    console.log("SKIP community view checks (no community posts available)");
  } else {
    const views = await runCheck({
      method: "GET",
      path: `/api/community/${communityPostId}/views`,
      description: "community post views endpoint",
      validate: (data) => data && typeof data.count === "number",
    });
    if (!views.ok) failures++;

    const recordView = await runCheck({
      method: "POST",
      path: `/api/community/${communityPostId}/view`,
      expectedStatus: 201,
      description: "record community post view",
      validate: (data) => data && typeof data.message === "string",
    });
    if (!recordView.ok) failures++;
  }

  const blogPostId = getIdFromCollection(blogPosts.data);
  if (blogPostId === null) {
    skipped++;
    console.log("SKIP blog interaction checks (no blog posts available)");
  } else {
    const likes = await runCheck({
      method: "GET",
      path: `/api/blog/posts/${blogPostId}/likes`,
      description: "blog post likes endpoint",
      validate: (data) =>
        data &&
        typeof data.count === "number" &&
        Array.isArray(data.users),
    });
    if (!likes.ok) failures++;

    const recordBlogView = await runCheck({
      method: "POST",
      path: `/api/blog/posts/${blogPostId}/view`,
      description: "record blog post view",
      validate: (data) => data && typeof data.message === "string",
    });
    if (!recordBlogView.ok) failures++;
  }

  console.log("");
  if (failures > 0) {
    console.error(`Smoke checks failed: ${failures} failure(s), ${skipped} skipped.`);
    process.exit(1);
  }

  console.log(`Smoke checks passed with ${skipped} skipped check(s).`);
}

runTests().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`Unexpected smoke test failure: ${message}`);
  process.exit(1);
});
