function ConfirmationModal({ modalState, setModalState, onConfirm }) {
  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className="close-modal-button">
          <button
            onClick={() => {
              setModalState(!modalState);
            }}
          >
            X
          </button>
        </div>
        <div className="modal-bar">
          <h3>Are you sure you want to proceed?</h3>
        </div>
        <div className="confirmation-buttons-bar">
          <button
            className="confrim-button"
            onClick={() => {
              onConfirm(); // Execute the correct action
              setModalState(!modalState); // Close modal after confirming
            }}
          >
            Yes
          </button>
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

export default ConfirmationModal;
