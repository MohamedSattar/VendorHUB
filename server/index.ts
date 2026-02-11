import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { handleDemo } from "./routes/demo";
import {
  handleExchangeToken,
  handleRefreshToken,
  handleGetUserInfo,
  handleLogin,
  handleRegister,
  handleVerifyInvitation,
  handleGetInvitation,
  handleForgotPassword,
  handleResetPassword,
  handleGetContactByEmail,
  handleUpdateContact,
  handleGetAllContacts,
} from "./routes/auth";
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
  handleSubmitEngagement,
  handleGetOpenRoles,
  handleGetOpenRoleById,
  handleGetCandidateContact,
  handleGetCandidateContactPhoto,
  handleUploadCandidateContactPhoto,
  handleGetEngagementContacts,
  handleGetEngagementContactPhoto,
  handleGetEngagementContactDocument,
  handleCreateEngagementContact,
  handleUpdateCandidateContact,
  handleAssignCandidateToOpenRole,
  handleUpdateOpenRole,
  handleUpdateContactById,
} from "./routes/odata";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // File upload middleware for photos (max 5MB)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });

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

  // Email/Password Authentication Routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/invitations/verify", handleVerifyInvitation);
  app.get("/api/auth/invitations/:code", handleGetInvitation);
  app.post("/api/auth/forgot-password", handleForgotPassword);
  app.post("/api/auth/reset-password", handleResetPassword);
  app.post("/api/auth/contact-by-email", handleGetContactByEmail);
  app.post("/api/auth/contact-update", handleUpdateContact);

  // Debug routes (development only)
  app.get("/api/auth/debug/contacts", handleGetAllContacts);

  // Protected user routes (require authentication)
  app.get("/api/user/profile", requireAuth, handleGetProfile);
  app.put("/api/user/profile", requireAuth, handleUpdateProfile);
  app.get("/api/user/resources", requireAuth, handleGetUserResources);
  app.delete(
    "/api/user/resources/:resourceId",
    requireAuth,
    handleDeleteResource,
  );

  // OData proxy routes (to avoid CORS issues)
  app.get("/api/odata/websitecontents", handleGetWebsiteContents);
  app.get("/api/odata/faq", handleGetFAQ);
  app.get("/api/odata/manuals", handleGetManuals);
  app.get("/api/odata/engagements", handleGetEngagements);
  app.get("/api/odata/engagements/:id", handleGetEngagementById);
  app.post("/api/odata/engagement/:id/submit", handleSubmitEngagement);
  app.get("/api/odata/open-roles/:engagementId", handleGetOpenRoles);
  app.get("/api/odata/open-role/:id", handleGetOpenRoleById);
  app.post(
    "/api/odata/open-role/:id/assign-candidate",
    handleAssignCandidateToOpenRole,
  );
  app.patch("/api/odata/open-role/:id", handleUpdateOpenRole);
  app.get("/api/odata/engagement-contacts", handleGetEngagementContacts);
  app.get(
    "/api/odata/engagement-contact-photo/:id",
    handleGetEngagementContactPhoto,
  );
  app.get("/api/odata/candidate-contact/:id", handleGetCandidateContact);
  app.post("/api/odata/engagement-contact", handleCreateEngagementContact);
  app.patch("/api/odata/candidate-contact/:id", handleUpdateCandidateContact);
  app.get(
    "/api/odata/candidate-contact-photo/:id",
    handleGetCandidateContactPhoto,
  );
  app.post(
    "/api/odata/candidate-contact-photo/:id",
    upload.single("file"),
    handleUploadCandidateContactPhoto,
  );
  // Route for document download: /api/odata/engagement-contact/{id}/{fieldName}/$value
  // Using regex to handle the $value part
  app.get(
    /^\/api\/odata\/engagement-contact\/(.+?)\/(.+?)\/\$value$/,
    (req, res) => {
      const id = req.params[0];
      const fieldName = req.params[1];
      const modifiedReq = {
        ...req,
        params: { id, fieldName },
      } as any;
      handleGetEngagementContactDocument(modifiedReq, res);
    },
  );

  // Contact management routes
  app.patch("/api/odata/contact/:id", handleUpdateContactById);

  return app;
}
