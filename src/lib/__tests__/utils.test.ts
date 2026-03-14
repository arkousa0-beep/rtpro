import { test } from "node:test";
import assert from "node:assert";
import { sanitizeLikePattern } from "../sql-utils.ts";

test("sanitizeLikePattern escapes %", () => {
  assert.strictEqual(sanitizeLikePattern("100%"), "100\\%");
});

test("sanitizeLikePattern escapes _", () => {
  assert.strictEqual(sanitizeLikePattern("user_name"), "user\\_name");
});

test("sanitizeLikePattern escapes \\", () => {
  assert.strictEqual(sanitizeLikePattern("path\\to"), "path\\\\to");
});

test("sanitizeLikePattern handles multiple special characters", () => {
  assert.strictEqual(sanitizeLikePattern("%_\\"), "\\%\\_\\\\");
});

test("sanitizeLikePattern returns empty string for empty input", () => {
  assert.strictEqual(sanitizeLikePattern(""), "");
});

test("sanitizeLikePattern returns empty string for null/undefined", () => {
  assert.strictEqual(sanitizeLikePattern(null), "");
  assert.strictEqual(sanitizeLikePattern(undefined), "");
});

test("sanitizeLikePattern leaves normal characters alone", () => {
  assert.strictEqual(sanitizeLikePattern("normal string"), "normal string");
});
