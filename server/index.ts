import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleExchangeToken, handleRefreshToken, handleGetUserInfo } from "./routes/auth";
import { requireAuth } from "./middleware/auth";
import {
  handleGetProfile,
  handleUpdateProfile,
  handleGetUserResources,
  handleDeleteResource,
} from "./routes/user";
import {
  handleGetWebsiteContents,
  handleGetFAQ,
  handleGetManuals,
  handleGetEngagements,
  handleGetEngagementById,
  handleGetOpenRoles,
  handleGetOpenRoleById,
  handleGetCandidateContact,
  handleGetCandidateContactPhoto,
  handleGetEngagementContacts,
  handleGetEngagementContactPhoto,
  handleGetEngagementContactDocument,
} from "./routes/odata";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // OAuth routes
  app.post("/api/auth/exchange-token", handleExchangeToken);
  app.post("/api/auth/refresh-token", handleRefreshToken);
  app.post("/api/auth/user-info", handleGetUserInfo);

  // Protected user routes (require authentication)
  app.get("/api/user/profile", requireAuth, handleGetProfile);
  app.put("/api/user/profile", requireAuth, handleUpdateProfile);
  app.get("/api/user/resources", requireAuth, handleGetUserResources);
  app.delete("/api/user/resources/:resourceId", requireAuth, handleDeleteResource);

  // OData proxy routes (to avoid CORS issues)
  app.get("/api/odata/websitecontents", handleGetWebsiteContents);
  app.get("/api/odata/faq", handleGetFAQ);
  app.get("/api/odata/manuals", handleGetManuals);
  app.get("/api/odata/engagements", handleGetEngagements);
  app.get("/api/odata/engagements/:id", handleGetEngagementById);
  app.get("/api/odata/open-roles/:engagementId", handleGetOpenRoles);
  app.get("/api/odata/open-role/:id", handleGetOpenRoleById);
  app.get("/api/odata/engagement-contacts", handleGetEngagementContacts);
  app.get("/api/odata/engagement-contact-photo/:id", handleGetEngagementContactPhoto);
  app.get("/api/odata/candidate-contact/:id", handleGetCandidateContact);
  app.get("/api/odata/candidate-contact-photo/:id", handleGetCandidateContactPhoto);
  app.get("/api/odata/engagement-contact/:id/:fieldName/$value", handleGetEngagementContactDocument);

  return app;
}
