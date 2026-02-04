import { Request, Response, NextFunction } from "express";

/**
 * Middleware to verify Bearer token in Authorization header
 * Note: In production, you would validate the token with Azure B2C
 * For now, we just verify the token is present
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    if (!token) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // In production, you would verify the token with Azure B2C
    // For now, we just attach it to the request
    (req as any).token = token;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}

/**
 * Type-safe request with authenticated user info
 */
export interface AuthenticatedRequest extends Request {
  token: string;
}
