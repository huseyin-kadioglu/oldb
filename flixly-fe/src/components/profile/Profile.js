import ProfileSummary from "./ProfileSummary";
import FrameBlock from './../common/FrameBlock';

const Profile = (props) => {
  return (
    <div>
      <ProfileSummary props={props} />
      <FrameBlock title = "Favourite Films"></FrameBlock>
      <FrameBlock title = "Recent Activity"></FrameBlock>
    </div>
  );
};
export default Profile;
