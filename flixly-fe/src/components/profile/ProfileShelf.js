import SectionHeader from "../ui/SectionHeader";
import ProfileCoverStrip from "./ProfileCoverStrip";

/** Başlık + Tümünü gör + ikincil aksiyon + kapak şeridi veya empty */
const ProfileShelf = ({
  title,
  to,
  linkLabel = "Tümü",
  action,
  books,
  limit = 10,
  singleRow = false,
  loading,
  empty,
}) => {
  const hasBooks = (books || []).length > 0;

  return (
    <section className="profile-section">
      <div className="profile-section-header-row">
        <SectionHeader title={title} to={hasBooks ? to : undefined} linkLabel={linkLabel} />
        {action}
      </div>
      {loading ? (
        <ProfileCoverStrip loading skeletonCount={singleRow ? Math.min(limit, 8) : 6} singleRow={singleRow} />
      ) : hasBooks ? (
        <ProfileCoverStrip books={books} limit={limit} singleRow={singleRow} />
      ) : (
        empty
      )}
    </section>
  );
};

export const ProfileEmpty = ({ children }) => (
  <div className="profile-empty profile-empty--compact">{children}</div>
);

export default ProfileShelf;
