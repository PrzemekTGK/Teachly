// Define ViewerDetails component
export default function ViewerDetails({ user }) {
  return (
    // Render viewer details container
    <div className="viewer-details">
      {/* Display username label and value */}
      <label>User Name:</label>
      <h3>{user.username}</h3>

      {/* Display email label and value */}
      <label>Email:</label>
      <h3>{user.email}</h3>

      {/* Display join date label and formatted value */}
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
