// middleware/roleMiddleware.js
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access only" });
  next();
};


export const isOrganizer = (req, res, next) => {

  if (req.user.role !== "organizer")
    return res.status(403).json({ message: "Organizer access only" });
  next();
};
