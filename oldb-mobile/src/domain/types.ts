export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  fullName: string;
  username: string;
};

export type LoginResponse = {
  token: string;
  expiresIn?: number;
  username: string;
  profileName?: string;
  role?: string;
  avatarUrl?: string | null;
  contributionPoint?: number | null;
};

export type ContinueReadingBook = {
  bookId: number;
  title?: string;
  authorName?: string;
  coverUrl?: string | null;
  currentPage?: number | null;
  pageCount?: number | null;
  updatedAt?: string | null;
};

export type ProfileSummary = {
  profileName?: string;
  username?: string;
  avatarUrl?: string | null;
  readingStreak?: number | null;
  yearlyBookGoal?: number | null;
  bookRead?: number | null;
  bookReadThisYear?: number | null;
  totalPagesRead?: number | null;
  continueReading?: ContinueReadingBook[];
  role?: string;
};

export type BookDto = {
  id: number;
  title?: string;
  authorName?: string;
  authorId?: number;
  coverUrl?: string | null;
  pageCount?: number | null;
  publishYear?: number | null;
  publisher?: string | null;
  isbn?: string | null;
  description?: string | null;
  genres?: string[] | string | null;
  averageRating?: number | null;
  ratingCount?: number | null;
  currentPage?: number | null;
  liked?: boolean;
  favourite?: boolean;
  favorite?: boolean;
  read?: boolean;
  isRead?: boolean;
  inReadList?: boolean;
  inLibrary?: boolean;
  inShopping?: boolean;
  dropped?: boolean;
  rating?: number | null;
};

export type DiscoverPage = {
  content?: BookDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  last?: boolean;
};

export type DailyReadCheckin = {
  checkedIn?: boolean;
  checkedInToday?: boolean;
  streak?: number;
  readingStreak?: number;
  date?: string;
};

export type UserActivityPayload = {
  bookId: number;
  authorId?: number | null;
  status?: string;
  actionType?: string;
  rating?: number | null;
  startDate?: string | null;
  readDate?: string | null;
  comment?: string | null;
  currentPage?: number | null;
  libraryFormat?: 'PHYSICAL' | 'PDF' | null;
};

export type SessionUser = {
  token: string;
  username: string;
  profileName?: string;
  role?: string;
  email?: string;
  avatarUrl?: string | null;
};
