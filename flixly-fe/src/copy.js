/**
 * Merkezi görünür UI metinleri — kayıt/okuma dilini tutarlı tutar.
 * Sosyal feed için “Aktivite” bilinçli korunur.
 */

export const COPY = {
  nav: {
    saveBook: "+ KAYDET",
    saveBookAria: "Kitap kaydet",
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
  },

  save: {
    dialogSelectTitle: "Kitap seç",
    dialogFormTitle: "Bu kitabı kaydet",
    dialogRootTitle: "Kitap kaydet",
    formName: "Okuma kaydı",
    changeBook: "Kitabı değiştir",
    searchPlaceholder: "Kitap adı veya yazar ara",
    submit: "Kaydet",
    submitting: "Kaydediliyor…",
    success: "Kitap kaydedildi",
    successAction: "Profilimde gör",
    needBook: "Önce bir kitap seç.",
    needStatus: "Bir okuma durumu seç.",
    errorGeneric: "Kayıt sırasında bir hata oluştu.",
  },

  status: {
    want: "Okuyacağım",
    reading: "Şu an okuyorum",
    read: "Okudum",
    dropped: "Bıraktım",
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
    title: "Diğer seçenekler",
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
    saveReview: "Kaydet / inceleme",
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

export default COPY;
