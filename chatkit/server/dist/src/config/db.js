import mongoose from "mongoose";
export const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("🍃 MongoDB Connected Successfully");
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        process.exit(1); // Stop the app if DB fails
    }
};
//# sourceMappingURL=db.js.map