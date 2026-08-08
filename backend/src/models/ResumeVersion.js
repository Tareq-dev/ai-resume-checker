const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    label: String,
    url: String,
  },
  { _id: false },
);

const basicsSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    location: String,
    email: String,
    phone: String,
    links: [linkSchema],
  },
  { _id: false },
);

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    location: String,
    period: String,
    bullets: [String],
  },
  { _id: false },
);

const educationSchema = new mongoose.Schema(
  {
    degree: String,
    school: String,
    location: String,
    period: String,
    details: String,
  },
  { _id: false },
);

const projectItemSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    tags: [String],
    link: [linkSchema],
  },
  { _id: false },
);
