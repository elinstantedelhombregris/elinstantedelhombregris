import type { Express } from "express";
import { storage } from "./storage";
import { authenticateToken, type AuthRequest } from './auth';
import { insertInitiativeMemberSchema, insertInitiativeMilestoneSchema, insertInitiativeMessageSchema, insertInitiativeTaskSchema, insertMembershipRequestSchema } from "@shared/schema-sqlite";

export function registerInitiativeRoutes(app: Express) {
  // ==================== INITIATIVE FEATURES ENDPOINTS ====================
  // NOTE: These routes must come BEFORE the generic /api/community/:id route

  // Initiative Members Endpoints
  app.get("/api/community/:postId/members", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const members = await storage.getInitiativeMembers(id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching initiative members:", error);
      res.status(500).json({ message: "Error fetching initiative members" });
    }
  });

  app.post("/api/community/:postId/join", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const { message } = req.body;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const result = await storage.addInitiativeMember(id, req.user!.userId, 'member');

      // Create notification for post creator
      const post = await storage.getCommunityPostWithDetails(id);
      if (post && post.userId && post.userId !== req.user!.userId) {
        await storage.createNotification(post.userId, {
          userId: post.userId,
          type: 'membership_approved',
          title: 'Nueva solicitud de membresía',
          content: `${req.user!.username} quiere unirse a tu iniciativa "${post.title}"`,
          postId: id
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Error joining initiative:", error);
      res.status(500).json({ message: "Error joining initiative" });
    }
  });

  app.post("/api/community/:postId/leave", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      // First get the member ID
      const members = await storage.getInitiativeMembers(id);
      const member = members.find(m => m.userId === req.user!.userId);
      if (member) {
        await storage.removeMember(member.id);
      }
      res.json({ message: "Successfully left initiative" });
    } catch (error) {
      console.error("Error leaving initiative:", error);
      res.status(500).json({ message: "Error leaving initiative" });
    }
  });

  // Membership Requests Endpoints
  app.get("/api/community/:postId/requests", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const requests = await storage.getMembershipRequests(id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching membership requests:", error);
      res.status(500).json({ message: "Error fetching membership requests" });
    }
  });

  app.post("/api/community/:postId/requests/:requestId/approve", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, requestId } = req.params;
      const postIdNum = parseInt(postId);
      const requestIdNum = parseInt(requestId);
      
      if (isNaN(postIdNum) || isNaN(requestIdNum)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }

      await storage.approveMembershipRequest(requestIdNum, req.user!.userId);
      res.json({ message: "Membership request approved" });
    } catch (error) {
      console.error("Error approving membership request:", error);
      res.status(500).json({ message: "Error approving membership request" });
    }
  });

  app.post("/api/community/:postId/requests/:requestId/reject", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, requestId } = req.params;
      const postIdNum = parseInt(postId);
      const requestIdNum = parseInt(requestId);
      
      if (isNaN(postIdNum) || isNaN(requestIdNum)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }

      await storage.rejectMembershipRequest(requestIdNum, req.user!.userId);
      res.json({ message: "Membership request rejected" });
    } catch (error) {
      console.error("Error rejecting membership request:", error);
      res.status(500).json({ message: "Error rejecting membership request" });
    }
  });

  // Milestones Endpoints
  app.get("/api/community/:postId/milestones", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const milestones = await storage.getInitiativeMilestones(id);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Error fetching milestones" });
    }
  });

  app.post("/api/community/:postId/milestones", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const milestone = await storage.createMilestone(id, {
        postId: id,
        title: req.body.title,
        description: req.body.description,
        status: 'pending',
        dueDate: req.body.dueDate
      });

      res.json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Error creating milestone" });
    }
  });

  app.put("/api/community/:postId/milestones/:milestoneId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { milestoneId } = req.params;
      const id = parseInt(milestoneId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid milestone ID" });
      }

      await storage.updateMilestone(id, req.body);
      res.json({ message: "Milestone updated" });
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Error updating milestone" });
    }
  });

  app.post("/api/community/:postId/milestones/:milestoneId/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { milestoneId } = req.params;
      const id = parseInt(milestoneId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid milestone ID" });
      }

      await storage.completeMilestone(id, req.user!.userId);
      res.json({ message: "Milestone completed" });
    } catch (error) {
      console.error("Error completing milestone:", error);
      res.status(500).json({ message: "Error completing milestone" });
    }
  });

  // Tasks Endpoints
  app.get("/api/community/:postId/tasks", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const tasks = await storage.getInitiativeTasks(id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });

  app.post("/api/community/:postId/tasks", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const task = await storage.createTask(id, {
        postId: id,
        title: req.body.title,
        description: req.body.description,
        status: 'todo',
        priority: req.body.priority || 'medium',
        assignedTo: req.body.assignedTo,
        dueDate: req.body.dueDate,
        createdBy: req.user!.userId
      });

      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Error creating task" });
    }
  });

  app.put("/api/community/:postId/tasks/:taskId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { taskId } = req.params;
      const id = parseInt(taskId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      await storage.updateTask(id, req.body);
      res.json({ message: "Task updated" });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Error updating task" });
    }
  });

  app.post("/api/community/:postId/tasks/:taskId/assign", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { taskId } = req.params;
      const { assignedTo } = req.body;
      const id = parseInt(taskId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      await storage.assignTask(id, assignedTo);
      res.json({ message: "Task assigned" });
    } catch (error) {
      console.error("Error assigning task:", error);
      res.status(500).json({ message: "Error assigning task" });
    }
  });

  app.post("/api/community/:postId/tasks/:taskId/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { taskId } = req.params;
      const id = parseInt(taskId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      await storage.completeTask(id);
      res.json({ message: "Task completed" });
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Error completing task" });
    }
  });

  // Messages/Chat Endpoints
  app.get("/api/community/:postId/messages", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const messages = await storage.getInitiativeMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/community/:postId/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const message = await storage.sendMessage(id, req.user!.userId, req.body.content, 'message');

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message" });
    }
  });
}
