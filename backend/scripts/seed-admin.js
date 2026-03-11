/* eslint-disable no-console */
const path = require("path");
const readline = require("readline");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const ask = (rl, question) =>
  new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));

const getArgFlag = (name) => process.argv.includes(name);

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Set it in backend/.env before running.");
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    const promote = getArgFlag("--promote");
    const updatePassword = getArgFlag("--set-password");

    const email = (process.env.ADMIN_EMAIL || (await ask(rl, "Admin email: "))).toLowerCase();
    const name = process.env.ADMIN_NAME || (await ask(rl, "Admin name (optional): "));
    const password = process.env.ADMIN_PASSWORD || (await ask(rl, "Admin password: "));

    if (!email) throw new Error("Email is required.");
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    await mongoose.connect(mongoUri);

    const existing = await User.findOne({ email });
    if (!existing) {
      const user = new User({
        name: name || "Admin",
        email,
        password,
        role: "admin",
      });
      await user.save();
      console.log(`Created admin: ${email}`);
      return;
    }

    if (existing.role === "admin") {
      if (updatePassword) {
        existing.password = password;
        await existing.save();
        console.log(`Updated admin password: ${email}`);
      } else {
        console.log(`Admin already exists: ${email}`);
      }
      return;
    }

    if (!promote) {
      console.log(
        `User already exists with role "${existing.role}": ${email}. Re-run with --promote to make them admin.`
      );
      return;
    }

    existing.role = "admin";
    if (updatePassword) existing.password = password;
    await existing.save();
    console.log(`Promoted user to admin: ${email}`);
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => undefined);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});

