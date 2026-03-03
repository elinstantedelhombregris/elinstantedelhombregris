import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { authenticateToken, type AuthRequest } from "./auth";
import {
  insertInitiativeMilestoneSchema,
  insertInitiativeTaskSchema,
} from "@shared/schema-sqlite";

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

export function registerInitiativeRoutes(app: Express) {
  // Compatibility aliases for legacy clients using PUT/assign variants.
  // Canonical initiative endpoints live in server/routes.ts.

  app.put(
    "/api/community/:postId/milestones/:milestoneId",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const milestoneId = parseId(req.params.milestoneId);
        if (milestoneId === null) {
          return res.status(400).json({ message: "Invalid milestone ID" });
        }

        const updates = insertInitiativeMilestoneSchema.partial().parse(req.body);
        await storage.updateMilestone(milestoneId, updates);
        res.json({ message: "Milestone updated" });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Validation error",
            details: error.errors,
          });
        }
        res.status(500).json({ message: "Failed to update milestone" });
      }
    }
  );

  app.put(
    "/api/community/:postId/tasks/:taskId",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const taskId = parseId(req.params.taskId);
        if (taskId === null) {
          return res.status(400).json({ message: "Invalid task ID" });
        }

        const updates = insertInitiativeTaskSchema.partial().parse(req.body);
        await storage.updateTask(taskId, updates);
        res.json({ message: "Task updated" });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Validation error",
            details: error.errors,
          });
        }
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  );

  app.post(
    "/api/community/:postId/tasks/:taskId/assign",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const taskId = parseId(req.params.taskId);
        if (taskId === null) {
          return res.status(400).json({ message: "Invalid task ID" });
        }

        const assignedTo =
          typeof req.body.assignedTo === "number"
            ? req.body.assignedTo
            : Number.parseInt(String(req.body.assignedTo), 10);

        if (!Number.isInteger(assignedTo) || assignedTo <= 0) {
          return res.status(400).json({ message: "Invalid assignedTo user ID" });
        }

        await storage.assignTask(taskId, assignedTo);
        res.json({ message: "Task assigned" });
      } catch (error) {
        res.status(500).json({ message: "Failed to assign task" });
      }
    }
  );
}
