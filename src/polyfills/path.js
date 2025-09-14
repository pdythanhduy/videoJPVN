// Simple path polyfill for browser
export const join = (...args) => {
  return args.join('/').replace(/\/+/g, '/');
};

export const resolve = (...args) => {
  return args.join('/').replace(/\/+/g, '/');
};

export const dirname = (path) => {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '.';
};

export const basename = (path, ext) => {
  const parts = path.split('/');
  const name = parts[parts.length - 1];
  if (ext && name.endsWith(ext)) {
    return name.slice(0, -ext.length);
  }
  return name;
};

export const extname = (path) => {
  const parts = path.split('.');
  if (parts.length > 1) {
    return '.' + parts[parts.length - 1];
  }
  return '';
};

export default {
  join,
  resolve,
  dirname,
  basename,
  extname
};
