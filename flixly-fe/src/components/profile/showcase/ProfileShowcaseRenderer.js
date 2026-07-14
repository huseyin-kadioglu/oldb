import FavoriteBooksShowcase from "./FavoriteBooksShowcase";
import QuoteShowcase from "./QuoteShowcase";
import { SHOWCASE_TYPE } from "./showcaseConstants";

/**
 * Type → component registry. Add new vitrine kinds here only.
 * Avoid growing if/else chains inside this module.
 */
const SHOWCASE_RENDERERS = {
  [SHOWCASE_TYPE.QUOTE]: QuoteShowcase,
  [SHOWCASE_TYPE.FAVORITE_BOOKS]: FavoriteBooksShowcase,
};

const ProfileShowcaseRenderer = ({
  item,
  isOwnProfile,
  showActions,
  busy,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const type = item.type || SHOWCASE_TYPE.QUOTE;
  const Component = SHOWCASE_RENDERERS[type] || QuoteShowcase;

  return (
    <Component
      item={item}
      isOwnProfile={isOwnProfile}
      showActions={showActions}
      busy={busy}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      onEdit={() => onEdit(item)}
      onDelete={() => onDelete(item)}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    />
  );
};

export default ProfileShowcaseRenderer;
