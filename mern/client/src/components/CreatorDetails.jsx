export default function CreatorDetails({ userState }) {
  return (
    <div className="creator-details">
      <label>User Name:</label>
      <h3>{userState.username}</h3>
      <label>First Name:</label>
      <h3>{userState.firstname}</h3>
      <label>Last Name:</label>
      <h3>{userState.lastname}</h3>
      <label>Email:</label>
      <h3>{userState.email}</h3>
      <label>Join Date:</label>
      <h3>
        {new Date(userState.date_joined).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </h3>
      <label>Your Streamer Key: </label>
      <h3>{userState.streamKey}</h3>
      <label>Stream Server: </label>
      <p>{"rtmp://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/live"}</p>
    </div>
  );
}
