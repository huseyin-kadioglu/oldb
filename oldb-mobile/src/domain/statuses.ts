/**
 * Mirrors backend BookActivityStatus — do not invent incompatible values.
 * "Currently reading" = READLIST + currentPage >= 1
 * "Want to read" = READLIST + currentPage === 0 (or unset)
 */

export const BookActivityStatus = {
  READ: 'READ',
  READLIST: 'READLIST',
  LIBRARY: 'LIBRARY',
  SHOPPING: 'SHOPPING',
  DROPPED: 'DROPPED',
  LIKE: 'LIKE',
  FAVOURITE: 'FAVOURITE',
  COMPLETED: 'COMPLETED',
} as const;

export type BookActivityStatusValue =
  (typeof BookActivityStatus)[keyof typeof BookActivityStatus];

/** Profile list path keys used by GET /profile/:username/list/:listType */
export const LibraryListType = {
  library: 'library',
  shopping: 'shopping',
  readlist: 'readlist',
  read: 'read',
  completed: 'completed',
  dropped: 'dropped',
  favorites: 'favorites',
} as const;

export type LibraryListTypeValue =
  (typeof LibraryListType)[keyof typeof LibraryListType];

export type LibraryShelfId =
  | 'reading'
  | 'want'
  | 'completed'
  | 'library'
  | 'shopping'
  | 'dropped'
  | 'favorites';

export const SHELF_TO_LIST_TYPE: Record<LibraryShelfId, LibraryListTypeValue> = {
  reading: LibraryListType.readlist,
  want: LibraryListType.readlist,
  completed: LibraryListType.read,
  library: LibraryListType.library,
  shopping: LibraryListType.shopping,
  dropped: LibraryListType.dropped,
  favorites: LibraryListType.favorites,
};

export function isCompletedStatus(status?: string | null): boolean {
  return (
    status === BookActivityStatus.READ || status === BookActivityStatus.COMPLETED
  );
}

export function readingProgressPercent(
  currentPage?: number | null,
  pageCount?: number | null
): number | null {
  if (
    currentPage == null ||
    pageCount == null ||
    !Number.isFinite(currentPage) ||
    !Number.isFinite(pageCount) ||
    pageCount <= 0
  ) {
    return null;
  }
  return Math.min(100, Math.max(0, Math.round((currentPage / pageCount) * 100)));
}
