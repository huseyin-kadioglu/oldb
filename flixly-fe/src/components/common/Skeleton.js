import "./Skeleton.css";

export const Skeleton = ({ className = "", style, width, height, radius, circle }) => (
  <span
    className={`skel${circle ? " skel--circle" : ""} ${className}`.trim()}
    style={{
      width,
      height,
      borderRadius: circle ? "50%" : radius,
      ...style,
    }}
    aria-hidden="true"
  />
);

export const HomeSkeleton = () => (
  <div className="skel-page skel-home" aria-busy="true" aria-label="Yükleniyor">
    {[0, 1, 2].map((row) => (
      <div key={row} className="skel-rail">
        <Skeleton height={18} width="45%" style={{ marginBottom: 14 }} />
        <div className="skel-rail-row">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="skel-cover" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const BookPageSkeleton = () => (
  <div className="skel-page skel-book" aria-busy="true" aria-label="Yükleniyor">
    <Skeleton height={14} width={64} style={{ marginBottom: 20 }} />
    <div className="skel-book-hero">
      <Skeleton className="skel-cover skel-cover--lg" />
      <div className="skel-book-meta">
        <Skeleton height={12} width="30%" />
        <Skeleton height={26} width="85%" style={{ marginTop: 10 }} />
        <Skeleton height={14} width="50%" style={{ marginTop: 10 }} />
        <div className="skel-actions" style={{ marginTop: 16 }}>
          <Skeleton height={40} width={40} radius={8} />
          <Skeleton height={40} width={40} radius={8} />
          <Skeleton height={40} width={40} radius={8} />
          <Skeleton height={40} width={40} radius={8} />
        </div>
      </div>
    </div>
    <Skeleton height={80} width="100%" radius={10} style={{ marginTop: 24 }} />
    <Skeleton height={120} width="100%" radius={10} style={{ marginTop: 16 }} />
  </div>
);

export const AuthorPageSkeleton = () => (
  <div className="skel-page skel-author" aria-busy="true" aria-label="Yükleniyor">
    <Skeleton height={14} width={64} style={{ marginBottom: 20 }} />
    <Skeleton height={28} width="55%" style={{ marginBottom: 20 }} />
    <div className="skel-rail-row skel-rail-row--wrap">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="skel-cover" />
      ))}
    </div>
    <div className="skel-author-card" style={{ marginTop: 28 }}>
      <Skeleton circle width={96} height={96} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skeleton height={14} width="90%" />
        <Skeleton height={14} width="70%" style={{ marginTop: 8 }} />
        <Skeleton height={14} width="80%" style={{ marginTop: 8 }} />
      </div>
    </div>
  </div>
);

export const DiscoverSkeleton = () => (
  <div className="skel-page skel-discover" aria-busy="true" aria-label="Yükleniyor">
    <Skeleton height={28} width="40%" style={{ marginBottom: 8 }} />
    <Skeleton height={14} width="60%" style={{ marginBottom: 18 }} />
    <Skeleton height={40} width="100%" radius={8} style={{ marginBottom: 16 }} />
    <div className="skel-discover-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skel-discover-cell">
          <Skeleton className="skel-cover" style={{ width: "100%", maxWidth: "none" }} />
          <Skeleton height={12} width="80%" style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
