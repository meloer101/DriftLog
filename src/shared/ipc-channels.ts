export const IPC = {
  STAMPS: {
    LIST: 'stamps:list',
    CREATE: 'stamps:create',
    UPDATE: 'stamps:update',
    DELETE: 'stamps:delete'
  },
  PROJECTS: {
    LIST: 'projects:list',
    CREATE: 'projects:create',
    UPDATE: 'projects:update',
    DELETE: 'projects:delete',
    ARCHIVE: 'projects:archive'
  },
  PROJECT_STAMPS: {
    LIST: 'project-stamps:list',
    ADD: 'project-stamps:add',
    REMOVE: 'project-stamps:remove',
    COMPLETE: 'project-stamps:complete',
    REORDER: 'project-stamps:reorder',
    SET_STATUS: 'project-stamps:set-status'
  },
  COMMITS: {
    LIST: 'commits:list',
    CREATE: 'commits:create'
  },
  WINDOW: {
    HIDE: 'window:hide',
    OPEN_DESKTOP: 'window:open-desktop'
  }
} as const
