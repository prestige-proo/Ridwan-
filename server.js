const express = require("express");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const Url = require("./models/Url");
const useragent = require("user-agent");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"));

/* SOCKET REALTIME */
io.on("connection", (socket) => {
  console.log("User connected");
});

/* CREATE SHORT URL */
app.post("/shorten", async (req, res) => {
  const { url } = req.body;
  const shortId = nanoid(7);

  const newUrl = await Url.create({
    originalUrl: url,
    shortId
  });

  res.json({
    shortUrl: `${process.env.BASE_URL}/${shortId}`
  });
});

/* REDIRECT + TRACK ANALYTICS */
app.get("/:id", async (req, res) => {
  const url = await Url.findOne({ shortId: req.params.id });

  if (!url) return res.send("Not found");

  const ua = useragent.parse(req.headers["user-agent"]);

  url.clicks += 1;
  url.clickData.push({
    time: new Date().toISOString(),
    device: ua.device || ua.os
  });

  await url.save();

  io.emit("update", url); // real-time update

  res.redirect(url.originalUrl);
});

/* DASHBOARD DATA */
app.get("/api/stats/:id", async (req, res) => {
  const url = await Url.findOne({ shortId: req.params.id });
  res.json(url);
});

server.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
