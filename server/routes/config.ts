import { RequestHandler } from "express";
import {
  getCurrentEnvironment,
  getAvailableEnvironments,
  switchEnvironment,
} from "../config/crmEnvironments";

/**
 * Get current CRM environment
 * GET /api/config/crm-environment
 */
export const handleGetCRMEnvironment: RequestHandler = (req, res) => {
  try {
    const currentEnv = getCurrentEnvironment();
    res.json({
      current: currentEnv,
      available: getAvailableEnvironments(),
    });
  } catch (error) {
    console.error("[Config] Error getting CRM environment:", error);
    res.status(500).json({
      error: "Failed to get CRM environment",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Switch CRM environment
 * POST /api/config/crm-environment/switch
 */
export const handleSwitchCRMEnvironment: RequestHandler = (req, res) => {
  try {
    const { environment } = req.body;

    if (!environment) {
      return res.status(400).json({
        error: "Environment name is required",
      });
    }

    console.log(`[Config] Switching to environment: ${environment}`);

    const newEnv = switchEnvironment(environment);

    res.json({
      success: true,
      message: `Switched to ${environment} environment`,
      current: newEnv,
      available: getAvailableEnvironments(),
    });
  } catch (error) {
    console.error("[Config] Error switching CRM environment:", error);
    res.status(400).json({
      error: "Failed to switch CRM environment",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
