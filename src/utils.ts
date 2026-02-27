import type { DescData } from './type';
import fs from 'node:fs';
import { destr } from 'destr';
import { join } from 'pathe';

function checkFileExists(filePath: string) {
  return fs.existsSync(filePath);
}

export function getMatchedPath(paths: string[] | undefined, path: string) {
  if (!paths)
    return path;

  paths.sort((a, b) => b.length - a.length);
  let u = path;
  for (const it of paths) {
    if (path.startsWith(it)) {
      u = it;
      break;
    }
  }

  // from path to u, find the first checkPkgExists is true path
  for (let i = path.length - 1; i >= u.length; i--) {
    if (path[i] === '/') {
      const checkPath = path.slice(0, i);
      if (checkPkgExists(checkPath)) {
        return checkPath;
      }
    }
  }

  return u;
}

export function checkPkgExists(rootPath: string) {
  return checkFileExists(join(rootPath, 'package.json'));
}

export function checkDotVsCodeExists(rootPath: string) {
  return checkFileExists(join(rootPath, '.vscode'));
}

export function readConfig(filePath: string): DescData {
  if (!checkFileExists(filePath)) {
    return {};
  }
  return destr(fs.readFileSync(filePath, 'utf-8'));
}

export function writeConfig(matchedPath: string, path: string, desc: string) {
  const filePath = join(matchedPath, '.vscode', 'folder-desc.json');

  if (!checkDotVsCodeExists(matchedPath)) {
    fs.mkdirSync(join(matchedPath, '.vscode'));
  }

  let descData: DescData = {};
  if (checkFileExists(filePath)) {
    descData = readConfig(filePath);
  }

  descData[path] = { description: desc };

  fs.writeFileSync(filePath, JSON.stringify(descData, null, 2));
}
