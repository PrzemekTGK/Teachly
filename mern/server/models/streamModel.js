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
  streamtitle: {
    type: String,
    required: true,
  },
  streamdescription: {
    type: String,
    required: true,
  },
  isLive: {
    type: Boolean,
    require: true,
  },
});

const Stream = mongoose.model("Stream", streamSchema);

export default Stream;
