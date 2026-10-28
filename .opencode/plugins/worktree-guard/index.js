import { assertEdit, recovery } from './guard.mjs';

// Plugin.define is an identity helper; a plain V2 definition needs no npm dependency.
export default {
  id: 'beaver-tools.worktree-guard',
  async setup(ctx) {
    await ctx.permission.hook('evaluate', async (event) => {
      if (event.action !== 'edit') return;
      try {
        const session = await ctx.session.get({ sessionID: event.sessionID });
        if (!event.resources.length) throw new Error(recovery);
        for (const path of event.resources) {
          assertEdit(session.location.directory, path);
        }
      } catch {
        // Fail closed on missing sessions, unknown paths, Git errors or detached HEAD.
        event.effect = 'deny';
        event.message = recovery;
      }
    });
  },
};
