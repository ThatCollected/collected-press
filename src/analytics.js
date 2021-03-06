const hasUpstash = typeof UPSTASH_URL === 'string'

/**
 *
 * @param {Array<string | number>} command
 * @returns {Promise<{ result: unknown }>}
 */
async function postUpstash(command) {
  return await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
    body: JSON.stringify(command),
  }).then(res => res.json())
}

// Using sorted set technique from: https://redis.com/ebook/part-1-getting-started/chapter-2-anatomy-of-a-redis-web-application/2-5-web-page-analytics/

const VIEW_KEY = 'viewed:'

/**
 *
 * @param {string} path
 * @returns
 */
export async function recordView(path) {
  if (!hasUpstash) {
    return null;
  }
  return postUpstash(['ZINCRBY', VIEW_KEY, -1, path])
}

export async function listViews(limit = 100) {
  return postUpstash(['ZRANGE', VIEW_KEY, 0, limit, 'WITHSCORES']).then(data =>
    data.result.map((value, index, views) => {
      const isKey = index % 2 === 0
      if (isKey) {
          return value;
      } else {
          return -1 * parseInt(value);
      }
    }),
  )
}
