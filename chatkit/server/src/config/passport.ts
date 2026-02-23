import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import User from "../models/Users.js";
import type { IUser } from "../types/user.js";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const authHandler = async (
  profile: any,
  done: (err: any, user?: any) => void,
  idField: keyof IUser,
) => {
  try {
    const email =
      profile.emails?.[0]?.value ||
      (profile.username ? `${profile.username}@github.com` : null);

    // 1. Try to find user by their OAuth Provider ID (googleId, githubId, etc.)
    let user = await User.findOne({ [idField]: profile.id });

    // 2. If not found by ID, try to find them by Email
    // This prevents creating a second account if James logs in with Google then later with GitHub
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        // Link the new provider ID to the existing account
        (user as any)[idField] = profile.id;
        await user.save();
      }
    }

    // 3. If still no user, perform SIGNUP (Create new user)
    if (!user) {
      user = await User.create({
        [idField]: profile.id,
        displayName: profile.displayName,
        email: email,
        avatar: profile.photos?.[0]?.value,
        isAdmin: false, // 🔒 Mandatory: Always default to false for new signups
      });
      console.log(`New Project Hermes user created: ${email}`);
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
};

// --- Strategies (Stay the same, calling updated authHandler) ---

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    (_at, _rt, profile, done) => authHandler(profile, done, "googleId" as any),
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: "/auth/github/callback",
    },
    (_at, _rt, profile, done) => authHandler(profile, done, "githubId" as any),
  ),
);
