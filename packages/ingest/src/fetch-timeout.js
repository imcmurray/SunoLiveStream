// fetch with a hard timeout. Bare fetch has none, so one hung socket (a firewall
// drop with no RST, a stalled TLS handshake) would freeze the 24/7 poll loops
// indefinitely. Every unattended network call in the ingest goes through this.
export async function fetchT(url, opts = {}, ms = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}
