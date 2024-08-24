import { FsEntryType, type FsEntry } from './types';

const isPlainObj = (obj: unknown) => obj && obj.constructor === Object;

const isPlainObjOrArray = (obj: unknown) =>
  obj && (obj.constructor === Object || obj.constructor === Array);

const comparableRg = /^function (RegExp|Date|((Big)?U?Int)\d+Array)\(/i;

const isComparable = (obj: any) => comparableRg.test(obj.constructor.toString());

export const deepEqual = (obj1: unknown, obj2: unknown) => {
  // refs or primitives
  if (obj1 === obj2) {
    return true;
  }

  // one is nullish
  if (!obj1 || !obj2) {
    return obj1 === obj2;
  }

  // non-equal types
  if (obj1.constructor.toString() !== obj2.constructor.toString()) {
    return false;
  }

  // comparables by toString()
  if (isComparable(obj1)) {
    return obj1.toString() === obj2.toString();
  }

  // non comparable by toString() but not plain object or array
  if (!isPlainObjOrArray(obj1)) {
    return false;
  }

  // plain objects or arrays

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }

  // compare props
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

export const deepMerge = (output: any, ...inputs: any[]) => {
  if (!inputs?.length || !isPlainObj(output)) {
    return output;
  }
  const input = inputs.shift();
  for (const key in input) {
    output[key] = isPlainObj(input[key])
      ? deepMerge(isPlainObj(output[key]) ? output[key] : {}, input[key])
      : input[key];
  }
  return deepMerge(output, ...inputs);
};

export const clone = (obj: unknown) => JSON.parse(JSON.stringify(obj));

export const deepSortKeys = (obj: unknown) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSortKeys);
  }

  const sortedObj = {};
  for (const key of Object.keys(obj).sort()) {
    sortedObj[key] = deepSortKeys(obj[key]);
  }
  return sortedObj;
  // or just return Object.keys(obj).sort().reduce((sortedObj, key) => ({...sortedObj, [key]: deepSortKeys(obj[key])}), {});
};

/**
 * Calculates a simple int32 hash value to an object
 * @see {@link https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0}
 * @param {object|array} obj - plain object or array
 * @returns int32 hash value
 */
export const getSimpleHash = (obj: any) => {
  const str = obj === undefined ? '' : JSON.stringify(deepSortKeys(obj));
  return [...str].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0); // x | 0 converts x to int32, like x & x
};

export const isDescendant = (parentPath: string, childPath: string, allowEqual = false) =>
  (allowEqual && childPath === parentPath) ||
  childPath.indexOf(parentPath.replace(/\\+$/, '') + '\\') === 0;

export const sortFsEntries = (a: FsEntry, b: FsEntry) => {
  const labelA = (a.label || a.fullPath || '').toLowerCase();
  const labelB = (b.label || b.fullPath || '').toLowerCase();
  if (a.type !== FsEntryType.File && b.type !== FsEntryType.File) {
    return labelA > labelB ? 1 : -1;
  }
  if (a.type !== FsEntryType.File) {
    return -1;
  }
  if (b.type !== FsEntryType.File) {
    return 1;
  }
  return labelA > labelB ? 1 : -1;
};
