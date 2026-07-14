export const SHOWCASE_TYPE = {
  QUOTE: "QUOTE",
  FAVORITE_BOOKS: "FAVORITE_BOOKS",
};

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 120;
export const QUOTE_MAX = 500;

/** Type metadata for labels — extend here when adding new vitrine kinds. */
export const SHOWCASE_TYPE_META = {
  [SHOWCASE_TYPE.QUOTE]: {
    label: "Favori Alıntı",
    icon: "💬",
  },
  [SHOWCASE_TYPE.FAVORITE_BOOKS]: {
    label: "Favori Kitaplar",
    icon: "📚",
  },
};

export const getTypeMeta = (type) =>
  SHOWCASE_TYPE_META[type] || SHOWCASE_TYPE_META[SHOWCASE_TYPE.QUOTE];

export const VITRINE_COPY = {
  section: "Profil Vitrini",
  manage: "Yönet",
  add: "Vitrin ekle",
  edit: "Düzenle",
  finishManage: "Bitir",
  delete: "Sil",
  cancel: "Vazgeç",
  update: "Güncelle",
  save: "Ekle",
  saving: "Kaydediliyor…",
  moveUp: "Yukarı",
  moveDown: "Aşağı",
  emptyTitle: "Profil vitrinin boş.",
  emptyBody: "Okuma kimliğini gösterecek içerikler ekleyebilirsin.",
  limitFull: "Tüm vitrin haklarını kullandın.",
  typeQuote: "Favori Alıntı",
  typeFavorites: "Favori Kitaplar",
  defaultFavoriteTitle: "Favori kitaplarım",
  defaultQuoteTitle: "Favori alıntım",
  pickType: "Vitrin türü",
  titleLabel: "Başlık",
  titlePlaceholder: "Örn. Hayallerim, Beni anlatan kitaplar",
  descriptionLabel: "Kısa açıklama (isteğe bağlı)",
  descriptionPlaceholder: "Bu seçkiyi bir cümleyle anlat…",
  favEmptyOwn: "Bu vitrinde gösterilecek favori kitap kalmadı.",
  favEditCta: "Vitrini düzenle",
  booksSelected: (n, max) => `${n} / ${max} kitap seçildi`,
  booksLimit: (max) => `Bu vitrinde en fazla ${max} kitap gösterebilirsin.`,
  noFavorites: "Henüz favori kitabın yok. Aşağıdan arayıp seçtiğin kitap favorilerine de eklenir.",
  searchBooks: "Kitap ara ve seç",
  searchPlaceholder: "Kitap adı veya yazar yaz…",
  searchHint: "Seçilen kitaplar favorilerine eklenir ve vitrinde gösterilir.",
  selectedBooks: "Seçilen kitaplar",
  removeBook: "Kaldır",
  readMore: "Devamını oku",
  readLess: "Daha az göster",
  deleteConfirmTitle: "Vitrini sil",
  deleteConfirmBody: "Bu vitrin profilinden kaldırılacak. Favori kitapların silinmez.",
  deleteConfirmAction: "Sil",
  saveError: "Vitrin kaydedilemedi.",
  deleteError: "Silinemedi.",
  quotePlaceholderBook: "Bu kitapla ilgili fikrin, alıntın veya anın…",
  quotePlaceholderSolo: "Paylaşmak istediğin sözü yaz…",
  pickBookOptional: "Kitap seç (opsiyonel)",
  clearBook: "Kitabı kaldır",
};
