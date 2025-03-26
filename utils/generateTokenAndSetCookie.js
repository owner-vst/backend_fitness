import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV !== "development",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  console.log("token in setcookie fun ", token);
  return token;
};
