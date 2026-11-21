// tsx requests a Unix effective UID while choosing its IPC temp path. Windows
// does not expose process.geteuid; provide a process-local ID for test startup.
if (process.platform === "win32" && typeof process.geteuid !== "function") {
  Object.defineProperty(process, "geteuid", { value: () => process.pid });
}

// Keep provider API tests deterministic and offline unless a test opts in explicitly.
if (process.env.HDMOVIE2_ENABLED === undefined) {
  process.env.HDMOVIE2_ENABLED = "false";
}
