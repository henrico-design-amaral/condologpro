const baseUrl = process.env.MEASURE_BASE_URL ?? 'http://localhost:3000';
const samples = Number(process.env.MEASURE_SAMPLES ?? '3');
const routes = [
  '/',
  '/admin',
  '/admin/packages',
  '/admin/residents',
  '/mobile',
  '/mobile/intake',
  '/mobile/pending'
];

function percentile(values, percent) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.ceil((percent / 100) * sorted.length) - 1;
  return sorted[Math.max(index, 0)];
}

for (const route of routes) {
  const timings = [];
  const statuses = [];

  for (let index = 0; index < samples; index += 1) {
    const startedAt = performance.now();
    const response = await fetch(`${baseUrl}${route}`, {
      headers: {
        'User-Agent': 'condologpro-route-measure'
      }
    });
    const body = await response.arrayBuffer();
    const elapsed = Math.round(performance.now() - startedAt);

    timings.push(elapsed);
    statuses.push(response.status);

    if (!response.ok) {
      throw new Error(`${route} returned ${response.status} with ${body.byteLength} bytes`);
    }
  }

  const average = Math.round(timings.reduce((total, value) => total + value, 0) / timings.length);
  console.log(
    `${route} status=${statuses.join(',')} ms=${timings.join(',')} avg=${average} p95=${percentile(timings, 95)}`
  );
}
