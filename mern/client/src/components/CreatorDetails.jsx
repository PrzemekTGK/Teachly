export default function CreatorDetails({ user }) {
  return (
    <div className="creator-details">
      <label>User Name:</label>
      <h4>{user.username}</h4>
      <label>First Name:</label>
      <h4>{user.firstname}</h4>
      <label>Last Name:</label>
      <h4>{user.lastname}</h4>
      <label>Email:</label>
      <h4>{user.email}</h4>
      <label>Join Date:</label>
      <h4>
        {new Date(user.date_joined).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </h4>
      <label>Your Streamer Key: </label>
      <h4>{user.streamKey}</h4>
      <label>Stream Server: </label>
      <h4>{"rtmp://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/live"}</h4>
    </div>
  );
}
