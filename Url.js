const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  time: String,
  device: String
});

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortId: String,
  clicks: { type: Number, default: 0 },
  clickData: [clickSchema]
});

module.exports = mongoose.model("Url", urlSchema);
