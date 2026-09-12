const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function createMariaDbConnectionUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);
  url.searchParams.set("timezone", "+00:00");
  if (loopbackHosts.has(url.hostname)) {
    url.searchParams.set("allowPublicKeyRetrieval", "true");
  }
  return url.toString();
}
