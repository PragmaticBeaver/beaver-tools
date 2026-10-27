import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse } from 'yaml';

function frontmatter(path) {
  const content = readFileSync(new URL(path, import.meta.url), 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  assert.ok(match, `Missing frontmatter: ${path}`);
  return parse(match[1]);
}

test('agent frontmatter preserves role boundaries and nested permission rules', () => {
  for (const name of [
    'developer',
    'researcher',
    'designer',
    'tester',
    'reviewer',
  ]) {
    const agent = frontmatter(`../.opencode/agents/${name}.md`);
    assert.equal(agent.mode, 'subagent');
    assert.equal(typeof agent.description, 'string');
    assert.ok(
      agent.permissions.some(
        (rule) =>
          rule.action === 'subagent' &&
          rule.effect === 'deny' &&
          rule.resource === '*',
      ),
      name,
    );
    if (name !== 'developer') {
      assert.ok(
        agent.permissions.some(
          (rule) =>
            rule.action === 'edit' &&
            rule.effect === 'deny' &&
            rule.resource === '*',
        ),
        name,
      );
    }
    for (const rule of agent.permissions) {
      assert.equal(typeof rule.action, 'string');
      assert.equal(typeof rule.resource, 'string');
      assert.ok(['allow', 'ask', 'deny'].includes(rule.effect));
    }
  }
});

test('project skills have parseable frontmatter and matching directory names', () => {
  const directory = new URL('../.opencode/skills/', import.meta.url);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skill = frontmatter(`../.opencode/skills/${entry.name}/SKILL.md`);
    assert.equal(skill.name, entry.name);
    assert.equal(typeof skill.description, 'string');
    if (skill.metadata) assert.equal(skill.metadata.project, 'beaver-tools');
  }
});
