import { useState } from "react";
import "./BookSummaryView.css";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";

const BookSummaryViewActivity = (props) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="activity">
      <div className="desc">
        <p>
          Marcus Aurelius (MS 121-MS 180): MS 121 yılında Roma'da doğdu. Fronto,
          Apollonius Chalcedonius gibi döneminin önde gelen hatip ve
          filozoflarından özel dersler aldı. MS 161-180 yılları arasında Roma
          İmparatoru olarak hüküm sürdü. "Stoacı İmparator", "Filozof İmparator"
          gibi sıfatlarla anılan Marcus Aurelius, barışçı bir insan olmasına
          rağmen hükümdarlığının çoğunu seferlerde geçirdi. MS 169 yılı
          sonlarında Germen kavimlerine karşı düzenlenen bir sefer esnasında
          yazmaya başladığı Kendime Düşünceler, Stoacılık özellikle de Roma
          Stoası açısından büyük bir öneme sahiptir. Sağlam bir eşitlik ve
          özgürlük inancına sahip olan Marcus Aurelius imparatorluğu boyunca
          doğayı bilip anlayarak yaşamaya çalışmış, her şeyin ortasına insanı
          koymuştur. Günlük olarak kaleme alınmış bir özdeyişler ve düşünceler
          derlemesi denebilecek Kendime Düşünceler eserinde kendinden önceki
          caesarları ve filozofları eleştirmekle kalmayıp, kendi kendini de
          sorguya çekerek bir vicdan muhasebesi de yapar. Sonraki kuşaklara,
          kilise düşünürlerine, Rönesans'a da temel olan Kendime Düşünceler,
          Stoa felsefesinin anlaşılması açısından günümüzde de çok değerli bir
          kaynaktır.
        </p>
      </div>

      <aside className="activity-menu">
        <ul>
          <li>
            <CheckBoxOutlineBlankIcon style={{ fontSize: 40 }} />
            <span>Watched</span>
          </li>
          <li>
            <FavoriteBorderIcon style={{ fontSize: 40 }} />
            <span>Like</span>
          </li>
          <li>
            <LibraryAddIcon style={{ fontSize: 40 }} />
            <span>Watchlist</span>
          </li>
        </ul>
      </aside>
    </div>
  );
};
export default BookSummaryViewActivity;
