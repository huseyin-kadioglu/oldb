/**
 * Yazar keşif seçimleri — FE heuristics until featuredBook arrives from API.
 * Prefer editor/staff flags, then chronology / community signal.
 */

const isEditorPick = (book) =>
  !!(book?.isEditorChoice || book?.editorChoice || book?.isWeeklyPick || book?.weeklyPick);

const communityScore = (book) => {
  const rating = Number(book?.averageRating) || 0;
  const count = Number(book?.ratingCount) || 0;
  const likes = Number(book?.howManyPplLiked) || 0;
  if (rating > 0 && count > 0) {
    return rating * Math.log10(count + 1) * 10 + likes;
  }
  return likes;
};

/** İlk kez okuyacaklara — editoryal / erken eser. */
export const pickStarterBook = (books = []) => {
  if (!books.length) return null;

  const featured = books.find(isEditorPick);
  if (featured) return featured;

  const dated = books
    .filter((b) => Number(b.publicationYear) > 0)
    .sort((a, b) => a.publicationYear - b.publicationYear);
  if (dated.length) return dated[0];

  return books[0];
};

/**
 * Topluluğun favorisi — yeterli değerlendirme tercih edilir.
 * minRatings: bar altındaysa yine en iyi skoru gösterir (kart gizlenmez).
 */
export const pickCommunityFavorite = (books = [], { minRatings = 3 } = {}) => {
  if (!books.length) return null;

  const ranked = [...books]
    .map((book) => ({ book, score: communityScore(book) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.book.averageRating || 0) - (a.book.averageRating || 0));

  if (ranked.length === 0) return null;

  const withEnough = ranked.find((x) => (Number(x.book.ratingCount) || 0) >= minRatings);
  return (withEnough || ranked[0]).book;
};

export const starterBlurb = (book, authorName) => {
  if (!book) return "";
  if (isEditorPick(book)) {
    return "Editörün bu yazar için önerdiği giriş kapısı.";
  }
  if (book.publicationYear > 0) {
    return `${authorName || "Yazar"}’ın evrenine ${book.publicationYear} tarihli bu eserle adım at.`;
  }
  return "Bu yazarın dünyasına yumuşak bir giriş.";
};

export const communityBlurb = (book) => {
  if (!book) return "";
  if (book.averageRating > 0 && book.ratingCount > 0) {
    const avg = Number.isInteger(book.averageRating)
      ? String(book.averageRating)
      : Number(book.averageRating).toFixed(1).replace(".", ",");
    return `${avg} ortalama · ${Number(book.ratingCount).toLocaleString("tr-TR")} değerlendirme`;
  }
  if (book.howManyPplLiked > 0) {
    return `${Number(book.howManyPplLiked).toLocaleString("tr-TR")} okur beğenisi`;
  }
  return "Topluluğun dikkatini çeken eser.";
};
