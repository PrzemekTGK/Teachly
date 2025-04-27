// Define CreatorDetails component with user prop
export default function CreatorDetails({ user }) {
  return (
    // Render container for creator details
    <div className="creator-details">
      {/* Display username label and value */}
      <label>User Name:</label>
      <h4>{user.username}</h4>
      {/* Display first name label and value */}
      <label>First Name:</label>
      <h4>{user.firstname}</h4>
      {/* Display last name label ԁnd value */}
      <label>Last Name:</label>
      <h4>{user.lastname}</h4>
      {/* Display email label and value */}
      <label>Email:</label>
      <h4>{user.email}</h4>
      {/* Display join date label and formatted date */}
      <label>Join Date:</label>
      <h4>
        {new Date(user.date_joined).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </h4>
      {/* Display stream key label and value */}
      <label>Your Streamer Key: </label>
      <h4>{user.streamKey}</h4>
      {/* Display stream server label and hardcoded RTMP URL */}
      <label>Stream Server: </label>
      <h4>{"rtmp://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/live"}</h4>
    </div>
  );
}
