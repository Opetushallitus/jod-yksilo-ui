/**
 * Minimal Tolgee REST client shared by the tag scripts.
 */

export const TOLGEE_API_URL = 'https://app.tolgee.io';

/**
 * Get all translation keys from Tolgee via API.
 *
 * @param {number} projectId
 * @param {string} apiKey
 * @returns {Promise<Array<{ keyId: number; keyName: string; keyNamespace: string | null; keyTags?: Array<{ id: number; name: string }> }>>}
 */
export async function getTolgeeKeys(projectId, apiKey) {
  const url = `${TOLGEE_API_URL}/v2/projects/${projectId}/translations`;
  const allKeys = [];
  let page = 0;
  const size = 1000;

  while (true) {
    const response = await fetch(`${url}?size=${size}&page=${page}`, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch keys from Tolgee: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    allKeys.push(...data._embedded.keys);

    if (data.page.number >= data.page.totalPages - 1) {
      break;
    }
    page++;
  }

  return allKeys;
}

/**
 * @param {string[]} newTagNames
 * @param {Array<{ id: number; name: string }>} currentTags
 * @returns {{ tagsToAdd: string[]; tagsToRemove: Array<{ id: number; name: string }> }}
 */
export function computeTagDiff(newTagNames, currentTags = []) {
  const currentTagNames = new Set(currentTags.map((t) => t.name));
  const tagsToAdd = newTagNames.filter((name) => !currentTagNames.has(name));
  const tagsToRemove = currentTags.filter((tag) => !newTagNames.includes(tag.name));
  return { tagsToAdd, tagsToRemove };
}

/**
 * Update tags for a key - adds new tags and removes old ones.
 *
 * @param {number} projectId - Tolgee project ID
 * @param {string} apiKey - Tolgee API key
 * @param {number} keyId - Key ID
 * @param {string[]} newTagNames - New tag names that should be on the key
 * @param {Array<{ id: number; name: string }>} currentTags - Current tags on the key
 */
export async function updateKeyTags(projectId, apiKey, keyId, newTagNames, currentTags = []) {
  const { tagsToAdd, tagsToRemove } = computeTagDiff(newTagNames, currentTags);

  // Add new tags
  for (const tagName of tagsToAdd) {
    const url = `${TOLGEE_API_URL}/v2/projects/${projectId}/keys/${keyId}/tags`;

    const requestBody = {
      name: tagName,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to add tag "${tagName}" to key ${keyId}: ${response.status} ${response.statusText}\n${errorBody}`,
      );
    }
  }

  // Remove old tags
  for (const tag of tagsToRemove) {
    const url = `${TOLGEE_API_URL}/v2/projects/${projectId}/keys/${keyId}/tags/${tag.id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to remove tag "${tag.name}" from key ${keyId}: ${response.status} ${response.statusText}\n${errorBody}`,
      );
    }
  }

  return true;
}
