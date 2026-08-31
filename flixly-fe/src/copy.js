/**
 * Merkezi görünür UI metinleri — kayıt/okuma dilini tutarlı tutar.
 * Sosyal feed için “Aktivite” bilinçli korunur.
 */

const formatStarValue = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n ?? "");
  return Number.isInteger(num) ? String(num) : String(num).replace(".", ",");
};

export const COPY = {
  nav: {
    saveBook: "+ KAYDET",
    saveBookAria: "Kitap logla",
    signIn: "Giriş yap",
    join: "Üye ol",
    activity: "Aktivite",
  },

  auth: {
    title: "Giriş yap",
    defaultReason: "Devam etmek için hesabına giriş yap.",
    resumeHint: "Giriş yapıldı. İşleme devam edebilirsin.",
    reasonSaveBook: "Bu kitabı kaydetmek için giriş yap.",
    reasonFavourite: "Favorilerine eklemek için giriş yap.",
    reasonLike: "Beğenmek için giriş yap.",
    reasonComment: "Yorum yazmak için giriş yap.",
    reasonFollow: "Bu kullanıcıyı takip etmek için giriş yap.",
    reasonGoal: "Okuma hedefi belirlemek için giriş yap.",
    reasonProgress: "Okuma ilerlemeni güncellemek için giriş yap.",
    reasonReview: "İnceleme yazmak için giriş yap.",
    reasonLibrary: "Kütüphanene eklemek için giriş yap.",
    reasonShopping: "Alınacaklara eklemek için giriş yap.",
    reasonRate: "Puan vermek için giriş yap.",
    reasonGeneric: "Devam etmek için hesabına giriş yap.",
    rememberMe: "Beni hatırla",
    sessionExpired: "Oturumun doldu. Tekrar giriş yap.",
  },

  save: {
    dialogSelectTitle: "Kitap seç",
    dialogFormTitle: "Kitabı logla",
    dialogRootTitle: "Kitap logla",
    formName: "Okuma kaydı",
    changeBook: "Kitabı değiştir",
    searchPlaceholder: "Kitap adı veya yazar ara",
    submit: "Kaydet",
    submitting: "Kaydediliyor…",
    success: "Kitap kaydedildi",
    successAction: "Profilimde gör",
    needBook: "Önce bir kitap seç.",
    needStatus: "Bir okuma durumu seç.",
    dateOrder: "Bitiş tarihi başlangıçtan önce olamaz.",
    errorGeneric: "Kayıt sırasında bir hata oluştu.",
    saveReview: "İnceleme yaz",
    editLog: "Kaydı düzenle",
  },

  toast: {
    needLogin: "Bu işlem için giriş yapmalısın.",
    errorGeneric: "İşlem sırasında bir hata oluştu.",
    statusError: "Durum güncellenemedi.",
    rateError: "Puan kaydedilemedi.",
    loginOk: "Giriş yapıldı.",
    want: "Okuyacaklarına eklendi",
    wantRemoved: "Okuyacaklarından çıkarıldı",
    reading: "Şu an okuyor olarak işaretlendi",
    readingRemoved: "Okuma durumun kaldırıldı",
    read: "Okudum olarak işaretlendi",
    readRemoved: "Okudum işareti kaldırıldı",
    library: "Kütüphanene eklendi",
    libraryRemoved: "Kütüphanenden çıkarıldı",
    like: "Beğenildi",
    likeRemoved: "Beğeni kaldırıldı",
    favourite: "Favorilerine eklendi",
    favouriteRemoved: "Favorilerinden çıkarıldı",
    shopping: "Alınacaklara eklendi",
    shoppingRemoved: "Alınacaklardan çıkarıldı",
    dropped: "Bıraktım olarak işaretlendi",
    droppedRemoved: "Bırakıldı işareti kaldırıldı",
    rated: (n) => `Puanın kaydedildi (${formatStarValue(n)}★)`,
    ratedAndRead: (n) =>
      `Puanın kaydedildi (${formatStarValue(n)}★) · Okudum olarak işaretlendi`,
    progress: "İlerleme kaydedildi",
    finished: "Okudum olarak işaretlendi",
    checkinUndo: "Bugünkü işaret kaldırıldı",
    seeLibrary: "Kütüphaneyi gör",
    seeProfile: "Profilimde gör",
  },

  status: {
    want: "Okuyacağım",
    reading: "Okuyorum",
    read: "Okudum",
    dropped: "Bıraktım",
    startReading: "Okumaya başla",
    label: "Durum",
  },

  fields: {
    rating: "Puanın",
    readDateOptional: "Okuma tarihi (isteğe bağlı)",
    startDateOptional: "Başlangıç tarihi (isteğe bağlı)",
    droppedDateOptional: "Tarih (isteğe bağlı)",
    noteOptional: "İnceleme veya not (isteğe bağlı)",
    noteShortOptional: "Kısa not (isteğe bağlı)",
    currentPage: "Şu an kaçıncı sayfadasın?",
    pageInvalid: "Geçerli bir sayfa gir.",
    pageTooHigh: "Sayfa, kitabın toplam sayfasını aşamaz.",
    libraryFormat: "Sahip olduğun format",
    formatPhysical: "Fiziksel",
    formatDigital: "PDF / Dijital",
  },

  other: {
    title: "Koleksiyon",
    library: "Kütüphanemde",
    libraryHelp: "Fiziksel veya dijital olarak sahip olduğun kitaplar.",
    shopping: "Alınacaklar",
    shoppingHelp: "Satın almak istediklerin.",
    like: "Beğen",
    likeHelp: "Beğendiğin kitaplar.",
    favourite: "Favori",
    favouriteHelp: "En sevdiğin kitaplar.",
  },

  empty: {
    noReadsOwn: "Henüz okunan kitap yok. İlk kaydını bırak.",
    noActivityOwn: "Henüz okuma kaydı yok — bir kitap kaydet.",
    noActivityGuest: "Henüz aktivite yok.",
    badgesStart: "Henüz rozet kazanılmadı — kitap kaydederek başla.",
    readingIdentity: "Daha fazla kitap kaydettikçe okuma kimliği burada şekillenir.",
    communityNone: "Bu ay henüz topluluk okuması yok — ilk kaydı sen bırakabilirsin.",
  },

  book: {
    saveReview: "İnceleme yaz",
    editLog: "Kaydı düzenle",
    detailSave: "Detaylı kayıt",
    savedChip: "Kaydedildi",
  },

  home: {
    heroGuest: "Kitaplarını keşfet ve kaydet.",
  },

  checkin: {
    prompt: "Bugün okuma yaptın mı?",
    action: "Okuma yaptım",
    done: "Bugünkü okuman tamamlandı",
    undoTitle: "Bugünkü işareti kaldır",
    hint: "Günlük okuma serini sürdürür; kitap durumlarını değiştirmez.",
    toastOk: "Bugünkü okuman kaydedildi",
    toastUndo: "Bugünkü işaret kaldırıldı",
    toastError: "Bugünkü okuma kaydedilemedi. Tekrar dene.",
    ariaMark: "Bugünkü okumayı işaretle",
    ariaUndo: "Bugünkü okuma işaretini kaldır",
    ariaBusy: "Okuma kaydı işleniyor",
    streak: (n) => `${n} günlük seri`,
  },

  public: {
    tagline: "Okuduğun kitapları kaydet, puanla ve listelerini paylaş.",
    joinCta: "Hemen üye ol",
  },
};

export const ghostToastMessage = (actionType, added) => {
  const messages = {
    LIKE: added ? COPY.toast.like : COPY.toast.likeRemoved,
    FAVOURITE: added ? COPY.toast.favourite : COPY.toast.favouriteRemoved,
    LIBRARY: added ? COPY.toast.library : COPY.toast.libraryRemoved,
    SHOPPING: added ? COPY.toast.shopping : COPY.toast.shoppingRemoved,
    DROPPED: added ? COPY.toast.dropped : COPY.toast.droppedRemoved,
    READ: added ? COPY.toast.read : COPY.toast.readRemoved,
    READLIST: added ? COPY.toast.want : COPY.toast.wantRemoved,
  };
  return messages[actionType] || null;
};

export default COPY;
