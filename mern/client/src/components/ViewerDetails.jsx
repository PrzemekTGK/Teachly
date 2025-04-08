export default function ViewerDetails({ user }) {
  return (
    <div className="viewer-details">
      <label>User Name:</label>
      <h3>{user.username}</h3>
      <label>Email:</label>
      <h3>{user.email}</h3>
      <label>Join Date:</label>
      <h3>
        {new Date(user.date_joined).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </h3>
    </div>
  );
}
