const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/tasks", [auth], async (req, res) => {
  const task = new Task({ ...req.body, user: req.user._id });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get("/tasks", [auth], async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  // if (req.query.limit || req.query.skip) {
  //   if (req.query.limit < 0 || req.query.skip < 0) res.status(400).send();
  // }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/tasks/:id", [auth], async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, user: req.user._id });
    if (task) return res.send(task);
    res.status(404).send("Task Not Found");
  } catch (e) {
    res.status(500).send(err);
  }
});

router.patch("/tasks/:id", [auth], async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidUpdates = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdates)
    return res.status(400).send({ error: "Invalid updates" });

  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, user: req.user._id });
    if (task) {
      updates.forEach((update) => (task[update] = req.body[update]));
      await task.save();
      return res.send(task);
    }

    res.status(404).send("Task Not Found");
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", [auth], async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id, user: req.user._id });
    if (task) return res.send(task);
    res.status(404).send("Task Not Found");
  } catch (error) {
    res.status(400).send(e);
  }
});

module.exports = router;
