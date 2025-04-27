// Define ConfirmationModal component with modalState, setModalState, and onConfirm props
export default function ConfirmationModal({
  modalState,
  setModalState,
  onConfirm,
}) {
  return (
    // Render modal background
    <div className="modal-background">
      {/* Render modal container */}
      <div className="modal-container">
        {/* Render close button section */}
        <div className="close-modal-button">
          {/* Button to toggle modal visibility */}
          <button
            onClick={() => {
              setModalState(!modalState);
            }}
          >
            X
          </button>
        </div>
        {/* Render modal title */}
        <div className="modal-bar">
          <h3>Are you sure you want to proceed?</h3>
        </div>
        {/* Render confirmation buttons */}
        <div className="confirmation-buttons-bar">
          {/* Confirm button to execute onConfirm and close modal */}
          <button
            className="confrim-button"
            onClick={() => {
              onConfirm();
              setModalState(!modalState);
            }}
          >
            Yes
          </button>
          {/* Cancel button to close modal */}
          <button
            className="cancel-button"
            onClick={() => {
              setModalState(!modalState);
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
