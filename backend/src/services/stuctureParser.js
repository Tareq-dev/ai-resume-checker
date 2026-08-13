const { GoogleGemini } = require("@google/gemini");
const { z } = require("zod");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

const ai = env.geminiApiKey
  ? new GoogleGemini({ apiKey: env.geminiApiKey })
  : null;

const linkSchema = {
  type: Type.OBJECT,
  properties: {
    level: { type: Type.STRING },
    url: { type: Type.STRING },
  },
};

const responseSchema = {
  type: Type.OBJECT,
  required: [
    "basics",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "interests",
    "links",
  ],
  properties: {
    basics: {
      type: Type.OBJECT,
      required: ["name", "title", "location", "email", "phone", "link"],
      properties: {
        name: { type: Type.STRING },
        title: { type: Type.STRING },
        location: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        link: { type: Type.STRING },
      },
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["company", "role", "period", "bullets"],
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          period: { type: Type.STRING },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["degree", "school", "period"],

        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING },
          period: { type: Type.STRING },
          location: { type: Type.STRING },
          details: { type: Type.STRING },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name", "description"],
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          tech: { type: Type.ARRAY, items: { type: Type.STRING } },
          link: { type: Type.STRING, items: linkSchema },
        },
      },
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name"],
        properties: {
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          year: { type: Type.STRING },
        },
      },
    },
    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
    interests: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

const validator = z.object({
  basics: z.object({
    name: z.string(),
    title: z.string(),
    location: z.string(),
    email: z.string().email(),
    phone: z.string(),
    link: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
  summary: z.string().default(""),
  experience: z
    .array(
      z.object({
        company: z.string().default(""),
        role: z.string().default(""),
        period: z.string().default(""),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string().default(""),
        school: z.string().default(""),
        period: z.string().default(""),
        location: z.string().default(""),
        details: z.string().default(""),
      }),
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(
    z.object({
      name: z.string().default(""),
      description: z.string().default(""),
      tech: z.array(z.string()).default([]),
      link: z
        .array(z.object({ label: z.string(), url: z.string() }))
        .default([]),
    }),
  ),
  certifications: z
    .array(
      z.object({
        name: z.string().default(""),
        issuer: z.string().default(""),
        year: z.string().default(""),
      }),
    )
    .default([]),
  languages: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
});

function buildPrompt(rawText) {
  return [
    "You are a resume parser. The input is text extracted from a PDF - lines may be jumbled or out of natural reading order.",
    "",
    "Extract structured data:",
    '-Basics: name, professional title, location, email, phone, social links (LinkedIn/ GitHub/ portfolio etc.; label like "LinkedIn",full URL)',
    "-Summary: the professional summary paragraph (rejoin if split across lines)",
    "-Experience: jobs most recent first, each with company, role, period(preserve original date formate), location if available,  and bullet points",
    "-Education: degree, school, period, location, optional details",
    "-Skills: flat array of technical skills",
    "-Projects: name, one sentence description, optional tech tags, optional links",
    "-Certifications: name, issuer, year",
    "-Languages: flat array",
    "-Interests: flat array",
    "",
    "Rules:",
    "- Be conservative: omit fields that are not clearly present. Use empty strings/arrays where missing",
    "- Each experience bullet should read as a complete sentence, even if the original text is fragmented",
    "- Preserve original date formats (e.g., 'Jan 2020 - May 2019').",
    "",
    "RESUME TEXT",
    "-------------",
    rawText,
    "-------------",
  ].join("\n");
}
