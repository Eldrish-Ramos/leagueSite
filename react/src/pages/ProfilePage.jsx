import { useParams } from 'react-router-dom';
import ProfileStats from '../components/ProfileStats';

function ProfilePage() {
  const { gameName, tagLine } = useParams();
  return (
    <div className="container gwen-profile-container">
      <h1 className="mb-4 gwen-profile-title">
        Profile: <span className="text-primary">{gameName}#{tagLine}</span>
      </h1>
      <ProfileStats gameName={gameName} tagLine={tagLine} />
    </div>
  );
}

export default ProfilePage;