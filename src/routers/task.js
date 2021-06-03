const express = require("express");
const Task = require("../models/task");

const router = express.Router();

router.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (e) {
    res.status(500).send(err);
  }
});

router.get("/tasks/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findById(_id);
    if (task) return res.send(task);
    res.status(404).send("Task Not Found");
  } catch (e) {
    res.status(500).send(err);
  }
});

router.patch("/tasks/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidUpdates = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdates)
    return res.status(400).send({ error: "Invalid updates" });

  const _id = req.params.id;
  try {
    const task = await Task.findById(_id);
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

router.delete("/tasks/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findByIdAndDelete(_id);
    if (task) return res.send(task);
    res.status(404).send("Task Not Found");
  } catch (error) {
    res.status(400).send(e);
  }
});

module.exports = router;
