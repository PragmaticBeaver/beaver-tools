import { execFileSync } from 'node:child_process';
import { lstatSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

export const recovery =
  'beaver-tools worktree guard: create a dedicated task worktree from current origin/main and move this session there. In a clean detached worktree, initialize it with git switch -c <task-branch> origin/main. Do not move or discard existing changes.';

function git(directory, ...args) {
  return execFileSync('git', ['-C', directory, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 10_000,
    // Never inherit a repository/index override from the host environment.
    env: Object.fromEntries(
      Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
    ),
  }).trim();
}

// Resolve existing symlinks, including parents of files not created yet.
export function canonicalPath(path) {
  try {
    return realpathSync(path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    // realpath also reports ENOENT for dangling symlinks. Never mistake an
    // existing link with an unknown destination for an ordinary new file.
    try {
      if (lstatSync(path).isSymbolicLink()) throw new Error(recovery);
    } catch (entryError) {
      if (entryError.code !== 'ENOENT') throw entryError;
    }
    const parent = dirname(path);
    if (parent === path) throw error;
    return resolve(canonicalPath(parent), relative(parent, path));
  }
}

function contains(root, path) {
  const suffix = relative(root, path);
  return (
    suffix === '' ||
    (!isAbsolute(suffix) && suffix !== '..' && !suffix.startsWith(`..${sep}`))
  );
}

function linkedWorktree(directory) {
  const root = realpathSync(git(directory, 'rev-parse', '--show-toplevel'));
  const gitDir = realpathSync(
    git(directory, 'rev-parse', '--absolute-git-dir'),
  );
  const commonDir = realpathSync(
    git(directory, 'rev-parse', '--path-format=absolute', '--git-common-dir'),
  );
  if (gitDir === commonDir) throw new Error(recovery);
  return { root, gitDir, commonDir };
}

export function taskWorktree(directory) {
  const worktree = linkedWorktree(directory);
  const branch = git(directory, 'branch', '--show-current');
  if (!branch || ['main', 'master'].includes(branch.toLowerCase())) {
    throw new Error(recovery);
  }
  return worktree;
}

export function assertEdit(directory, resource) {
  const worktree = taskWorktree(directory);
  const target = canonicalPath(resolve(directory, resource));
  if (!contains(worktree.root, target)) throw new Error(recovery);
  // No edits to Git administration, even when .git is a file in a worktree.
  if (contains(resolve(worktree.root, '.git'), target))
    throw new Error(recovery);
  let parent = target;
  while (true) {
    try {
      if (statSync(parent).isDirectory()) break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    parent = dirname(parent);
  }
  const owner = taskWorktree(parent);
  if (owner.root !== worktree.root || owner.gitDir !== worktree.gitDir) {
    throw new Error(recovery);
  }
}
