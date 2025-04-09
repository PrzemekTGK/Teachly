import mongoose from "mongoose";

const streamSchema = mongoose.Schema({
  streamerId: {
    type: String,
    required: true,
  },
  streamUrl: {
    type: String,
    required: true,
  },
  streamTitle: {
    type: String,
    required: true,
  },
  streamDescription: {
    type: String,
    required: true,
  },
});

const Video = mongoose.model("Video", streamSchema);

export default Stream;
