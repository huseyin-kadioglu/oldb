/** Türkçe aktivite / inceleme cümleleri */
export const formatActivitySentence = (status, bookTitle, actorName) => {
  const title = bookTitle || "bir kitap";
  const name = actorName ? `${actorName}, ` : "";

  switch (status) {
    case "READ":
    case "COMPLETED":
      return (
        <>
          {name}
          <em>{title}</em>
          {" kitabını okudu"}
        </>
      );
    case "READLIST":
      return (
        <>
          {name}
          <em>{title}</em>
          {" kitabını okuma listesine ekledi"}
        </>
      );
    case "LIBRARY":
      return (
        <>
          {name}
          <em>{title}</em>
          {" kitabını kütüphanesine ekledi"}
        </>
      );
    case "SHOPPING":
      return (
        <>
          {name}
          <em>{title}</em>
          {" kitabını alınacaklar listesine ekledi"}
        </>
      );
    case "DROPPED":
      return (
        <>
          {name}
          <em>{title}</em>
          {" kitabını bırakıldı olarak işaretledi"}
        </>
      );
    case "FAVOURITE":
      return (
        <>
          {name}
          <em>{title}</em>
          {" kitabını favorilerine ekledi"}
        </>
      );
    case "LIKE":
      return (
        <>
          {name}
          <em>{title}</em>
          {" kitabını beğendi"}
        </>
      );
    case "REVIEW":
      return (
        <>
          {name}
          <em>{title}</em>
          {" hakkında inceleme yazdı"}
        </>
      );
    default:
      return (
        <>
          {name}
          <em>{title}</em>
          {" ile etkileşim kurdu"}
        </>
      );
  }
};

/** Feed kart başlığı için kısa fiil (Sen / Ahmet + fiil) */
export const formatStatusVerb = (status, isYou = false) => {
  const you = !!isYou;
  switch (status) {
    case "READ":
    case "COMPLETED":
      return you ? "okudun" : "okudu";
    case "READLIST":
      return you ? "listene ekledin" : "listesine ekledi";
    case "LIBRARY":
      return you ? "kütüphanene ekledin" : "kütüphanesine ekledi";
    case "SHOPPING":
      return you ? "alınacaklara ekledin" : "alınacaklara ekledi";
    case "DROPPED":
      return you ? "bıraktın" : "bıraktı";
    case "FAVOURITE":
      return you ? "favoriledin" : "favoriledi";
    case "LIKE":
      return you ? "beğendin" : "beğendi";
    default:
      return you ? "etkileşim kurdun" : "etkileşim kurdu";
  }
};

export default formatActivitySentence;
