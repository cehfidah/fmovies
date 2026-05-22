const INDEXNOW_KEY = '541a5a4687e9eff22b43d28365976f87';
const SITE_HOST = 'www.fmoviesz.cyou';
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

/**
 * Submit one or more URLs to IndexNow (notifies Bing, Yandex, and other
 * participating search engines immediately).
 */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;

  const body = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  // 200 / 202 = accepted, anything else is an error
  if (!res.ok && res.status !== 202) {
    console.error(`[indexnow] Submission failed: ${res.status} ${res.statusText}`);
  } else {
    console.log(`[indexnow] Submitted ${urls.length} URL(s): ${urls.join(', ')}`);
  }
}
