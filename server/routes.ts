import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { orderFormSchema, insertProjectSchema, loginSchema } from "@shared/schema";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { broadcastProjectsUpdate, broadcastOrdersUpdate, broadcastSettingsUpdate } from "./websocket";

declare module "express-session" {
  interface SessionData {
    adminId?: number;
    adminUsername?: string;
  }
}

const MemoryStoreSession = MemoryStore(session);

const serviceLabels: Record<string, string> = {
  graphicDesign: 'Graphic Design',
  academicHelp: 'Academic Help (Joki Tugas)',
  flyer: 'Flyer & Brochure',
  poster: 'Poster',
  socialMedia: 'Social Media Content',
  uiux: 'UI/UX Design',
  essay: 'Essay / Paper',
  ppt: 'PowerPoint Presentation',
  resume: 'Resume / Summary',
};

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000
    }),
    secret: process.env.SESSION_SECRET || 'cipet-admin-secret-key-2024',
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    }
  }));

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      console.log(`[AUTH] Login attempt for user: ${username}`);
      
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin) {
        console.log(`[AUTH] User not found: ${username}`);
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
      }
      
      console.log(`[AUTH] User found: ${admin.username}, checking password...`);
      const isValid = await verifyPassword(password, admin.password);
      
      if (!isValid) {
        console.log(`[AUTH] Invalid password for user: ${username}`);
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
      }
      
      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;
      
      req.session.save((err) => {
        if (err) {
          console.log(`[AUTH] Session save error:`, err);
          return res.status(500).json({ success: false, message: 'Session error' });
        }
        console.log(`[AUTH] Login successful for user: ${username}, session ID: ${req.sessionID}`);
        return res.json({ 
          success: true, 
          user: { id: admin.id, username: admin.username, role: admin.role } 
        });
      });
    } catch (error) {
      console.log(`[AUTH] Login error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const admin = await storage.getAdminById(req.session.adminId!);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
      res.json({ 
        success: true, 
        user: { id: admin.id, username: admin.username, role: admin.role } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/auth/setup', async (req, res) => {
    try {
      const existing = await storage.getAdminByUsername('admin');
      if (existing) {
        return res.status(400).json({ success: false, message: 'Admin already exists' });
      }
      
      const hashedPassword = await hashPassword('admin123');
      const admin = await storage.createAdmin({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@cipet.com',
        role: 'admin'
      });
      
      res.json({ 
        success: true, 
        message: 'Admin created successfully',
        credentials: { username: 'admin', password: 'admin123' }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/auth/change-password', requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      
      const admin = await storage.getAdminById(req.session.adminId!);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
      
      const isValid = await verifyPassword(currentPassword, admin.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      
      const newHashedPassword = await hashPassword(newPassword);
      await storage.updateAdminPassword(admin.id, newHashedPassword);
      
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.get('/api/admin/projects', requireAuth, async (req, res) => {
    try {
      const projectList = await storage.getAllProjects();
      res.json(projectList);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
  });

  app.get('/api/admin/projects/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProjectById(id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch project' });
    }
  });

  app.post('/api/admin/projects', requireAuth, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      broadcastProjectsUpdate();
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ success: false, message: 'Failed to create project' });
    }
  });

  app.patch('/api/admin/projects/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.updateProject(id, req.body);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      broadcastProjectsUpdate();
      res.json(project);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update project' });
    }
  });

  app.delete('/api/admin/projects/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      broadcastProjectsUpdate();
      res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
  });

  app.get('/api/admin/orders', requireAuth, async (req, res) => {
    try {
      const orderList = await storage.getAllOrders();
      res.json(orderList);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
  });

  app.get('/api/admin/orders/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch order' });
    }
  });

  app.patch('/api/admin/orders/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.updateOrder(id, req.body);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      broadcastOrdersUpdate();
      res.json(order);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update order' });
    }
  });

  app.delete('/api/admin/orders/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteOrder(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      broadcastOrdersUpdate();
      res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete order' });
    }
  });

  app.get('/api/admin/settings', requireAuth, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
  });

  app.post('/api/admin/settings', requireAuth, async (req, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.setSetting({ key, value });
      broadcastSettingsUpdate();
      res.json(setting);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to save setting' });
    }
  });

  app.get('/api/admin/stats', requireAuth, async (req, res) => {
    try {
      const [projectList, orderList] = await Promise.all([
        storage.getAllProjects(),
        storage.getAllOrders()
      ]);
      
      const stats = {
        totalProjects: projectList.length,
        totalOrders: orderList.length,
        pendingOrders: orderList.filter(o => o.status === 'pending').length,
        completedOrders: orderList.filter(o => o.status === 'completed').length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  });

  app.get('/api/projects', async (req, res) => {
    try {
      const projectList = await storage.getAllProjects();
      res.json(projectList);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
  });

  app.post('/api/order', async (req, res) => {
    try {
      const validatedData = orderFormSchema.parse(req.body);

      const order = await storage.createOrder({
        name: validatedData.name,
        contact: validatedData.contact,
        serviceCategory: validatedData.serviceCategory,
        subService: validatedData.subService,
        topic: validatedData.topic,
        deadline: validatedData.deadline,
        budget: validatedData.budget,
        status: 'pending',
        notes: null
      });

      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

      if (webhookUrl) {
        const serviceCategoryLabel = serviceLabels[validatedData.serviceCategory] || validatedData.serviceCategory;
        const subServiceLabel = serviceLabels[validatedData.subService] || validatedData.subService;

        const embed = {
          title: 'New Order Received!',
          description: 'A new order has been submitted via the Cipet website.',
          color: 0x00FF00,
          fields: [
            {
              name: 'Client Name',
              value: validatedData.name,
              inline: true,
            },
            {
              name: 'WhatsApp',
              value: validatedData.contact,
              inline: true,
            },
            {
              name: 'Service Category',
              value: serviceCategoryLabel,
              inline: true,
            },
            {
              name: 'Specific Service',
              value: subServiceLabel,
              inline: true,
            },
            {
              name: 'Deadline',
              value: validatedData.deadline,
              inline: true,
            },
            {
              name: 'Budget',
              value: `Rp ${validatedData.budget}`,
              inline: true,
            },
            {
              name: 'Project Description',
              value: validatedData.topic.length > 1024 
                ? validatedData.topic.substring(0, 1021) + '...' 
                : validatedData.topic,
              inline: false,
            },
          ],
          footer: {
            text: 'Cipet Creative Freelancer',
          },
          timestamp: new Date().toISOString(),
        };

        const discordPayload = {
          embeds: [embed],
        };

        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordPayload),
          });
        } catch (discordError) {
          console.error('Discord webhook error:', discordError);
        }
      }

      broadcastOrdersUpdate();
      return res.status(200).json({
        success: true,
        message: 'Order submitted successfully!',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Order submission error:', error);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      });
    }
  });

  return httpServer;
}
