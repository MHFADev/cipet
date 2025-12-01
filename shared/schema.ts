import { z } from "zod";
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const serviceCategories = ['graphicDesign', 'academicHelp'] as const;
export type ServiceCategory = typeof serviceCategories[number];

export const graphicDesignTypes = ['flyer', 'poster', 'socialMedia', 'uiux'] as const;
export type GraphicDesignType = typeof graphicDesignTypes[number];

export const academicHelpTypes = ['essay', 'ppt', 'resume'] as const;
export type AcademicHelpType = typeof academicHelpTypes[number];

export const orderFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contact: z.string().min(10, 'Please enter a valid WhatsApp number'),
  serviceCategory: z.enum(serviceCategories, {
    errorMap: () => ({ message: 'Please select a service category' }),
  }),
  subService: z.string().min(1, 'Please select a specific service type'),
  topic: z.string().min(10, 'Please provide more details about your project'),
  deadline: z.string().min(1, 'Please specify a deadline'),
  budget: z.string().min(1, 'Please specify your budget'),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

export interface OrderSubmission extends OrderFormData {
  submittedAt: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

export interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const orderStatuses = ['pending', 'inProgress', 'completed', 'cancelled'] as const;
export type OrderStatus = typeof orderStatuses[number];

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  serviceCategory: text("service_category").notNull(),
  subService: text("sub_service").notNull(),
  topic: text("topic").notNull(),
  deadline: text("deadline").notNull(),
  budget: text("budget").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

export interface PortfolioItem {
  id: string;
  title: string;
  category: ServiceCategory;
  imageUrl: string;
  description: string;
}

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginData = z.infer<typeof loginSchema>;
