# Roadmap

## Convex Production Hardening

- Keep Convex as the only application backend for story data and story media.
- Keep production builds coupled to `convex deploy --cmd` so the frontend receives the production `VITE_CONVEX_URL`.
- Remove migration-only code once data and media are confirmed in Convex.

## Manual Story Editing

- Add an admin-only story editor for creating, editing, publishing, unpublishing, and deleting stories.
- Use a simple shared admin password for the first version, checked only inside Convex mutations against a secret stored in Convex environment variables.
- Store delete backups for 30 days before permanent removal.
- Prefer soft deletes first: add `deletedAt`, `deletedBy`, and `deleteReason` fields, then hide deleted stories from public queries.
- Add a scheduled cleanup after backups and restore flows are proven.

## Snapshots, Diffing, And Version Control

- Propose the best story diff/version-control design before implementing it.
- Evaluate storing each saved story version as a separate `storyVersions` document with author, timestamp, changed fields, and full body text.
- Evaluate snapshot exports stored in Convex file storage, with admin buttons to create a cloud snapshot, view cloud snapshots, and download a local copy.
- Decide whether diffs should be computed on demand from adjacent versions or stored as generated patch text.
