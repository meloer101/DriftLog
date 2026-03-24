"use strict";
const electron = require("electron");
const IPC = {
  STAMPS: {
    LIST: "stamps:list",
    CREATE: "stamps:create",
    UPDATE: "stamps:update",
    DELETE: "stamps:delete"
  },
  PROJECTS: {
    LIST: "projects:list",
    CREATE: "projects:create",
    UPDATE: "projects:update",
    DELETE: "projects:delete",
    ARCHIVE: "projects:archive"
  },
  PROJECT_STAMPS: {
    LIST: "project-stamps:list",
    ADD: "project-stamps:add",
    REMOVE: "project-stamps:remove",
    REORDER: "project-stamps:reorder",
    SET_STATUS: "project-stamps:set-status"
  },
  COMMITS: {
    LIST: "commits:list",
    CREATE: "commits:create"
  },
  WINDOW: {
    HIDE: "window:hide"
  }
};
const api = {
  stamps: {
    list: () => electron.ipcRenderer.invoke(IPC.STAMPS.LIST),
    create: (input) => electron.ipcRenderer.invoke(IPC.STAMPS.CREATE, input),
    update: (id, updates) => electron.ipcRenderer.invoke(IPC.STAMPS.UPDATE, id, updates),
    delete: (id) => electron.ipcRenderer.invoke(IPC.STAMPS.DELETE, id)
  },
  projects: {
    list: () => electron.ipcRenderer.invoke(IPC.PROJECTS.LIST),
    create: (input) => electron.ipcRenderer.invoke(IPC.PROJECTS.CREATE, input),
    update: (id, updates) => electron.ipcRenderer.invoke(IPC.PROJECTS.UPDATE, id, updates),
    delete: (id) => electron.ipcRenderer.invoke(IPC.PROJECTS.DELETE, id),
    archive: (id) => electron.ipcRenderer.invoke(IPC.PROJECTS.ARCHIVE, id)
  },
  projectStamps: {
    list: (projectId) => electron.ipcRenderer.invoke(IPC.PROJECT_STAMPS.LIST, projectId),
    add: (projectId, stampId) => electron.ipcRenderer.invoke(IPC.PROJECT_STAMPS.ADD, projectId, stampId),
    remove: (id) => electron.ipcRenderer.invoke(IPC.PROJECT_STAMPS.REMOVE, id),
    setStatus: (id, status) => electron.ipcRenderer.invoke(IPC.PROJECT_STAMPS.SET_STATUS, id, status),
    reorder: (items) => electron.ipcRenderer.invoke(IPC.PROJECT_STAMPS.REORDER, items)
  },
  commits: {
    list: (projectId) => electron.ipcRenderer.invoke(IPC.COMMITS.LIST, projectId),
    create: (input) => electron.ipcRenderer.invoke(IPC.COMMITS.CREATE, input)
  },
  window: {
    hide: () => electron.ipcRenderer.invoke(IPC.WINDOW.HIDE)
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
