
import mongoose from "mongoose";
import "dotenv/config";

async function debug() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }), "users");
    const users = await User.find().limit(5);
    console.log("Found users (direct find on 'users'):", users.length);
    if (users.length > 0) {
      console.log("First user email:", users[0].email);
    }

    const User2 = mongoose.model("User2", new mongoose.Schema({}, { strict: false }), "User");
    const users2 = await User2.find().limit(5);
    console.log("Found users (direct find on 'User'):", users2.length);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Debug error:", err);
  }
}

debug();
