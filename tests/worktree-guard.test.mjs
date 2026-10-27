import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { assertEdit } from '../.opencode/plugins/worktree-guard/guard.mjs';
import plugin from '../.opencode/plugins/worktree-guard/index.js';

const temporary = mkdtempSync(join(tmpdir(), 'beaver-tools-worktree-guard-'));
after(() => rmSync(temporary, { recursive: true, force: true }));

function git(cwd, ...args) {
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

const root = join(temporary, 'repository');
const task = join(temporary, 'task');
mkdirSync(root);
git(root, 'init', '-b', 'main');
git(
  root,
  '-c',
  'user.name=Guard test',
  '-c',
  'user.email=guard@example.invalid',
  '-c',
  'commit.gpgsign=false',
  'commit',
  '--allow-empty',
  '-m',
  'fixture',
);
git(root, 'worktree', 'add', '-b', 'chore/guard-test', task);

test('main checkout stays read-only, even after switching to a feature branch', () => {
  assert.throws(() => assertEdit(root, 'new.txt'));
  git(root, 'switch', '-c', 'feature/not-a-worktree');
  try {
    assert.throws(() => assertEdit(root, 'new.txt'));
  } finally {
    git(root, 'switch', 'main');
  }
});

test('allows existing files, new directories and subdirectory-relative edits in task worktree', () => {
  writeFileSync(join(task, 'existing.txt'), 'fixture');
  mkdirSync(join(task, 'src'));
  assert.doesNotThrow(() => assertEdit(task, 'existing.txt'));
  assert.doesNotThrow(() => assertEdit(task, 'new/directory/file.txt'));
  assert.doesNotThrow(() => assertEdit(join(task, 'src'), '../existing.txt'));
});

test('rejects absolute/relative escapes, main targets and sibling-prefix paths', () => {
  for (const path of [
    join(root, 'file.txt'),
    '../repository/file.txt',
    '../task-other/file.txt',
    '..',
  ]) {
    assert.throws(() => assertEdit(task, path), path);
  }
});

test('rejects symlink escapes for existing and not-yet-created files', () => {
  symlinkSync(root, join(task, 'main-link'), 'dir');
  writeFileSync(join(root, 'existing.txt'), 'do not change');
  for (const path of [
    'main-link/existing.txt',
    'main-link/new/deep/file.txt',
  ]) {
    assert.throws(() => assertEdit(task, path));
  }
  assert.equal(
    readFileSync(join(root, 'existing.txt'), 'utf8'),
    'do not change',
  );
});

test('rejects dangling file and directory symlinks, including missing descendants', () => {
  symlinkSync(join(root, 'missing-file.txt'), join(task, 'dangling-file'));
  symlinkSync(
    join(root, 'missing-directory'),
    join(task, 'dangling-directory'),
    'dir',
  );
  symlinkSync(
    join(task, 'missing-internal.txt'),
    join(task, 'dangling-internal'),
  );
  for (const path of [
    'dangling-file',
    'dangling-directory/new/deep/file.txt',
    'dangling-internal',
  ]) {
    assert.throws(() => assertEdit(task, path), path);
  }
});

test('rejects Git administration paths and nested repositories', () => {
  assert.throws(() => assertEdit(task, '.git'));
  const nested = join(task, 'nested');
  mkdirSync(nested);
  git(nested, 'init', '-b', 'main');
  assert.throws(() => assertEdit(task, 'nested/new.txt'));
});

test('rechecks branch on every call, rejecting main, master and detached HEAD', () => {
  for (const branch of ['main', 'master']) {
    git(task, 'symbolic-ref', 'HEAD', `refs/heads/${branch}`);
    assert.throws(() => assertEdit(task, 'file.txt'));
    git(task, 'symbolic-ref', 'HEAD', 'refs/heads/chore/guard-test');
  }
  git(task, 'switch', '--detach');
  assert.throws(() => assertEdit(task, 'file.txt'));
  git(task, 'switch', 'chore/guard-test');
  assert.doesNotThrow(() => assertEdit(task, 'file.txt'));
});

test('fails closed outside Git and when the session directory is missing', () => {
  assert.throws(() => assertEdit(temporary, 'file.txt'));
  assert.throws(() => assertEdit(join(temporary, 'missing'), 'file.txt'));
});

async function hooks(
  getSession = async () => ({ location: { directory: task } }),
) {
  const registered = {};
  await plugin.setup({
    permission: {
      hook: async (name, callback) => {
        registered[name] = callback;
      },
    },
    shell: {
      hook: async (name, callback) => {
        registered[name] = callback;
      },
    },
    session: { get: getSession },
  });
  return registered;
}

test('plugin leaves shell lifecycle unrestricted for worktree creation and detached recovery', async () => {
  const registered = await hooks();
  assert.equal(registered['create.before'], undefined);

  const detached = join(temporary, 'bootstrap');
  git(root, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  git(root, 'worktree', 'add', '-b', 'fix/bootstrap', detached, 'origin/main');
  git(detached, 'switch', '--detach');
  assert.throws(() => assertEdit(detached, 'file.txt'));
  writeFileSync(join(detached, 'untracked.txt'), 'preserve');
  git(detached, 'switch', 'fix/bootstrap');
  assert.equal(
    readFileSync(join(detached, 'untracked.txt'), 'utf8'),
    'preserve',
  );
  assert.doesNotThrow(() => assertEdit(detached, 'file.txt'));
  git(detached, 'switch', '--detach');
});

test('V2 plugin checks every patch resource, preserves denies/asks and ignores reads', async () => {
  const registered = await hooks();
  for (const effect of ['allow', 'ask', 'deny']) {
    const event = {
      sessionID: 'fixture',
      action: 'edit',
      resources: ['new.txt'],
      effect,
    };
    await registered.evaluate(event);
    assert.equal(event.effect, effect);
  }
  const patch = {
    action: 'edit',
    resources: ['new.txt', join(root, 'new.txt')],
    effect: 'allow',
  };
  await registered.evaluate(patch);
  assert.equal(patch.effect, 'deny');
  assert.match(patch.message, /move this session/);
  const read = {
    action: 'read',
    resources: [join(root, 'new.txt')],
    effect: 'allow',
  };
  await registered.evaluate(read);
  assert.equal(read.effect, 'allow');
});

test('V2 plugin uses current session location after a move/model change, not plugin location', async () => {
  let directory = root;
  const registered = await hooks(async () => ({ location: { directory } }));
  for (const next of [root, task, root]) {
    directory = next;
    const event = { action: 'edit', resources: ['new.txt'], effect: 'allow' };
    await registered.evaluate(event);
    assert.equal(event.effect, next === task ? 'allow' : 'deny');
  }
});

test('V2 plugin denies edits on API failures and empty targets', async () => {
  const registered = await hooks(async () => {
    throw new Error('session unavailable');
  });
  const edit = { action: 'edit', resources: ['new.txt'], effect: 'allow' };
  await registered.evaluate(edit);
  assert.equal(edit.effect, 'deny');
  const normal = await hooks();
  const empty = { action: 'edit', resources: [], effect: 'allow' };
  await normal.evaluate(empty);
  assert.equal(empty.effect, 'deny');
});

test('V2 plugin preserves shell permissions in main, task, detached and non-Git directories', async () => {
  for (const directory of [
    root,
    task,
    join(temporary, 'bootstrap'),
    temporary,
  ]) {
    const registered = await hooks(async () => ({ location: { directory } }));
    for (const command of [
      'npm run verify',
      'git worktree add -b fix/new-task ../new-task origin/main',
      'git switch fix/bootstrap',
      'git switch -c fix/next-task origin/main',
    ]) {
      for (const effect of ['allow', 'ask', 'deny']) {
        const shell = { action: 'shell', resources: [command], effect };
        await registered.evaluate(shell);
        assert.equal(shell.effect, effect);
        assert.equal(shell.message, undefined);
      }
    }
    assert.equal(registered['create.before'], undefined);
  }
});

test('project configuration does not introduce a blanket shell approval requirement', () => {
  const config = JSON.parse(
    readFileSync(new URL('../opencode.json', import.meta.url), 'utf8'),
  );
  assert.equal(
    config.permissions.some((rule) => rule.action === 'shell'),
    false,
  );
  assert.ok(
    config.permissions.some(
      (rule) => rule.action === 'external_directory' && rule.effect === 'ask',
    ),
  );
});
