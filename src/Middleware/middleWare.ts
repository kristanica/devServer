import express, { Request, Response, NextFunction } from "express";
import { auth } from "../admin/admin";
interface IUserRequest extends express.Request {
  user?: any;
}
const middleWare = async (
  req: IUserRequest,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  try {
    const token = authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch {
    return res.status(401).json({ message: "You are not authorized" });
  }
};

export default middleWare;
