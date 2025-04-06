export default function CreatorDetails({ userState }) {
  return (
    <div className="creator-details">
      <label>User Name:</label>
      <h4>{userState.username}</h4>
      <label>First Name:</label>
      <h4>{userState.firstname}</h4>
      <label>Last Name:</label>
      <h4>{userState.lastname}</h4>
      <label>Email:</label>
      <h4>{userState.email}</h4>
      <label>Join Date:</label>
      <h4>
        {new Date(userState.date_joined).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </h4>
      <label>Your Streamer Key: </label>
      <h4>{userState.streamKey}</h4>
      <label>Stream Server: </label>
      <h4>{"rtmp://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/live"}</h4>
    </div>
  );
}
