import { createHash } from 'node:crypto';

export const STORYSHIP_CANONICALIZATION_POLICY = 'storyship-canonical-json-v1';

function fail(message) {
  const error = new TypeError(message);
  error.code = 'INVALID_JSON_VALUE';
  throw error;
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeJson(value, path = '$', ancestors = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail(`${path} must contain only finite numbers`);
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) fail(`${path} must not contain cycles`);
    ancestors.add(value);
    try {
      const normalized = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!(index in value)) fail(`${path} must not contain sparse arrays`);
        normalized.push(normalizeJson(value[index], `${path}[${index}]`, ancestors));
      }
      return normalized;
    } finally {
      ancestors.delete(value);
    }
  }
  if (!isPlainObject(value) || Object.getOwnPropertySymbols(value).length > 0) {
    fail(`${path} must contain only JSON-safe plain objects`);
  }
  if (ancestors.has(value)) fail(`${path} must not contain cycles`);
  ancestors.add(value);
  try {
    const normalized = {};
    for (const key of Object.keys(value)) {
      normalized[key] = normalizeJson(value[key], `${path}.${key}`, ancestors);
    }
    return normalized;
  } finally {
    ancestors.delete(value);
  }
}

function serialize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(serialize).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map(key => `${JSON.stringify(key)}:${serialize(value[key])}`).join(',')}}`;
}

export function canonicalStringify(value) {
  return serialize(normalizeJson(value));
}

export function hashCanonical(value) {
  return `sha256:${createHash('sha256').update(canonicalStringify(value), 'utf8').digest('hex')}`;
}

export function deepFreezeJson(value) {
  const clone = JSON.parse(canonicalStringify(value));
  const freeze = node => {
    if (node && typeof node === 'object' && !Object.isFrozen(node)) {
      for (const child of Object.values(node)) freeze(child);
      Object.freeze(node);
    }
    return node;
  };
  return freeze(clone);
}
