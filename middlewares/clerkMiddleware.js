const { clerkMiddleware, getAuth } = require("@clerk/express");

// Register Clerk middleware globally before using authentication functions
const applyClerkMiddleware = (app) => {
  app.use(clerkMiddleware());
};

const authenticateUser = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: No valid user session" });
  }

  req.user = { id: userId }; // Store user ID in request object
  next();
};

module.exports = { applyClerkMiddleware, authenticateUser };
