function ConfirmationModal({ modalState, setModalState }) {
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
        <button>Yes</button>
        <button>No</button>
      </div>
    </div>
  );
}

export default ConfirmationModal;
