import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { User } from "../models/users.model.js";
import { Complaint } from "../models/complaints.model.js";
import { ComplaintImage } from "../models/complaintImages.model.js";
import { ComplaintUpdate } from "../models/complaintUpdates.model.js";
import { Notification } from "../models/notifications.model.js";

dotenv.config({ path: "./.env" });

// Helper to create sample SVG images for demo complaints if not present
function ensureSampleImages() {
  const uploadDir = path.resolve("public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const sampleImages = [
    {
      name: "sample-garbage-before.svg",
      text: "GARBAGE DUMP — BEFORE RESOLUTION",
      bg: "#fef2f2",
      color: "#b91c1c"
    },
    {
      name: "sample-garbage-after.svg",
      text: "GARBAGE CLEARED — AFTER RESOLUTION",
      bg: "#ecfdf5",
      color: "#047857"
    },
    {
      name: "sample-pothole-before.svg",
      text: "LARGE POTHOLE — BEFORE REPAIR",
      bg: "#fffbeb",
      color: "#b45309"
    },
    {
      name: "sample-pothole-progress.svg",
      text: "POTHOLE REPAIR IN PROGRESS",
      bg: "#eff6ff",
      color: "#1d4ed8"
    },
    {
      name: "sample-pothole-after.svg",
      text: "ROAD RESURFACED — AFTER RESOLUTION",
      bg: "#ecfdf5",
      color: "#047857"
    },
    {
      name: "sample-drainage-before.svg",
      text: "BLOCKED DRAINAGE — SEWAGE LEAK",
      bg: "#fef2f2",
      color: "#b91c1c"
    },
    {
      name: "sample-water-before.svg",
      text: "WATER PIPELINE DAMAGE — BEFORE",
      bg: "#eff6ff",
      color: "#1d4ed8"
    },
    {
      name: "sample-water-after.svg",
      text: "PIPELINE REPAIRED — AFTER RESOLUTION",
      bg: "#ecfdf5",
      color: "#047857"
    }
  ];

  for (const img of sampleImages) {
    const filePath = path.join(uploadDir, img.name);
    if (!fs.existsSync(filePath)) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="${img.bg}"/>
  <rect x="40" y="40" width="720" height="420" fill="none" stroke="${img.color}" stroke-width="4" stroke-dasharray="10,10" rx="12"/>
  <circle cx="400" cy="200" r="60" fill="${img.color}" opacity="0.2"/>
  <path d="M370 200 L400 170 L430 200 M400 170 L400 230" stroke="${img.color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="400" y="300" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="${img.color}" text-anchor="middle">${img.text}</text>
  <text x="400" y="340" font-family="system-ui, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">Smart City Municipal Corporation Verification Record</text>
</svg>`;
      fs.writeFileSync(filePath, svg);
    }
  }
}

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas!");

    ensureSampleImages();

    console.log("Clearing existing data collections...");
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await ComplaintImage.deleteMany({});
    await ComplaintUpdate.deleteMany({});
    await Notification.deleteMany({});
    console.log("Cleared collections.");

    console.log("Creating demo users...");

    // 1. Admin
    const admin = await User.create({
      name: "Smart City Admin",
      email: "admin@smartcity.local",
      password: "Admin@123",
      phone: "+91 98765 43210",
      role: "ADMIN",
      designation: "Chief Municipal Administrator",
      department: "Other",
      employeeId: "ADM-001",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      isActive: true
    });

    // 2. Staff: Waste Management
    const staffWaste = await User.create({
      name: "Amit Patil",
      email: "staff@smartcity.local",
      password: "Staff@123",
      phone: "+91 98220 12345",
      role: "STAFF",
      department: "Waste Management",
      designation: "Senior Sanitation Inspector",
      employeeId: "WM-101",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      isActive: true
    });

    // 3. Staff: Roads Department
    const staffRoads = await User.create({
      name: "Rajesh Shinde",
      email: "staff.roads@smartcity.local",
      password: "Staff@123",
      phone: "+91 98221 23456",
      role: "STAFF",
      department: "Roads",
      designation: "Road Maintenance Engineer",
      employeeId: "RD-204",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      isActive: true
    });

    // 4. Staff: Drainage & Water
    const staffWater = await User.create({
      name: "Suresh Deshmukh",
      email: "staff.water@smartcity.local",
      password: "Staff@123",
      phone: "+91 98222 34567",
      role: "STAFF",
      department: "Water Supply",
      designation: "Pipeline Operations Supervisor",
      employeeId: "WS-305",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      isActive: true
    });

    // 5. Citizen
    const citizen = await User.create({
      name: "Rahul Sharma",
      email: "citizen@smartcity.local",
      password: "Citizen@123",
      phone: "+91 91234 56789",
      role: "CITIZEN",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      isActive: true
    });

    console.log("Demo users created successfully!");

    console.log("Creating realistic sample complaints across workflow stages...");

    // Complaint 1: SUBMITTED (Garbage accumulated near park)
    const comp1 = await Complaint.create({
      complaintNumber: "SC-2026-000001",
      citizen: citizen._id,
      title: "Garbage accumulated near park",
      description: "Large amount of garbage has accumulated near the community park gate, causing severe odor and stray animal menace.",
      category: "Waste Management",
      subcategory: "Garbage Dump",
      aiCategory: "Waste Management",
      aiSubcategory: "Garbage Dump",
      aiConfidence: 0.94,
      priority: "HIGH",
      aiPriority: "HIGH",
      status: "SUBMITTED",
      locationAddress: "Joggers Park Main Gate, College Road, Nashik"
    });

    await ComplaintImage.create({
      complaint: comp1._id,
      imageUrl: "/uploads/sample-garbage-before.svg",
      imageType: "BEFORE",
      uploadedBy: citizen._id
    });

    await ComplaintUpdate.create({
      complaint: comp1._id,
      user: citizen._id,
      status: "SUBMITTED",
      message: "Complaint registered by citizen Rahul Sharma. Local AI detected category: Waste Management (94% confidence)."
    });

    // Complaint 2: IN_PROGRESS (Large pothole near college)
    const comp2 = await Complaint.create({
      complaintNumber: "SC-2026-000002",
      citizen: citizen._id,
      title: "Large pothole near college junction",
      description: "Deep pothole dangerous for two-wheelers during peak traffic hours right in front of the college entrance.",
      category: "Roads",
      subcategory: "Pothole",
      aiCategory: "Roads",
      aiSubcategory: "Pothole",
      aiConfidence: 0.96,
      priority: "HIGH",
      aiPriority: "HIGH",
      status: "IN_PROGRESS",
      assignedStaff: staffRoads._id,
      locationAddress: "Near KTHM College Gate, Gangapur Road, Nashik"
    });

    await ComplaintImage.create({
      complaint: comp2._id,
      imageUrl: "/uploads/sample-pothole-before.svg",
      imageType: "BEFORE",
      uploadedBy: citizen._id
    });

    await ComplaintImage.create({
      complaint: comp2._id,
      imageUrl: "/uploads/sample-pothole-progress.svg",
      imageType: "PROGRESS",
      uploadedBy: staffRoads._id
    });

    await ComplaintUpdate.create({
      complaint: comp2._id,
      user: citizen._id,
      status: "SUBMITTED",
      message: "Complaint registered by citizen Rahul Sharma."
    });

    await ComplaintUpdate.create({
      complaint: comp2._id,
      user: admin._id,
      status: "ASSIGNED",
      message: `Assigned to ${staffRoads.name} (Roads Department) by Admin.`
    });

    await ComplaintUpdate.create({
      complaint: comp2._id,
      user: staffRoads._id,
      status: "IN_PROGRESS",
      message: "Work commenced on site. Asphalt filling machine dispatched. Progress photo uploaded."
    });

    // Complaint 3: RESOLVED (Water pipeline leak - Before and After images)
    const comp3 = await Complaint.create({
      complaintNumber: "SC-2026-000003",
      citizen: citizen._id,
      title: "Drinking water pipeline leakage",
      description: "High pressure drinking water leaking continuously from the underground main pipe on 5th avenue.",
      category: "Water Supply",
      subcategory: "Pipeline Damage",
      aiCategory: "Water Supply",
      aiSubcategory: "Pipeline Damage",
      aiConfidence: 0.92,
      priority: "CRITICAL",
      aiPriority: "HIGH",
      status: "RESOLVED",
      assignedStaff: staffWater._id,
      locationAddress: "Plot 14, 5th Avenue, Mahatma Nagar, Nashik",
      resolvedAt: new Date(Date.now() - 3600000 * 4)
    });

    await ComplaintImage.create({
      complaint: comp3._id,
      imageUrl: "/uploads/sample-water-before.svg",
      imageType: "BEFORE",
      uploadedBy: citizen._id
    });

    await ComplaintImage.create({
      complaint: comp3._id,
      imageUrl: "/uploads/sample-water-after.svg",
      imageType: "AFTER",
      uploadedBy: staffWater._id
    });

    await ComplaintUpdate.create({
      complaint: comp3._id,
      user: citizen._id,
      status: "SUBMITTED",
      message: "Complaint registered with high priority."
    });

    await ComplaintUpdate.create({
      complaint: comp3._id,
      user: admin._id,
      status: "ASSIGNED",
      message: `Assigned to Suresh Deshmukh (Water Supply) with CRITICAL priority.`
    });

    await ComplaintUpdate.create({
      complaint: comp3._id,
      user: staffWater._id,
      status: "IN_PROGRESS",
      message: "Excavation completed and damaged pipe section isolated."
    });

    await ComplaintUpdate.create({
      complaint: comp3._id,
      user: staffWater._id,
      status: "RESOLVED",
      message: "Main valve gasket replaced and pipeline pressure tested. Area refilled and cleaned. After photo uploaded."
    });

    // Complaint 4: REOPENED (Garbage issue reopened by citizen)
    const comp4 = await Complaint.create({
      complaintNumber: "SC-2026-000004",
      citizen: citizen._id,
      title: "Overflowing commercial bin",
      description: "Dustbin overflowing near local vegetable market.",
      category: "Waste Management",
      subcategory: "Overflowing Dustbin",
      aiCategory: "Waste Management",
      aiSubcategory: "Overflowing Dustbin",
      aiConfidence: 0.91,
      priority: "HIGH",
      aiPriority: "HIGH",
      status: "REOPENED",
      assignedStaff: staffWaste._id,
      locationAddress: "Vegetable Market, CIDCO, Nashik",
      citizenConfirmed: false,
      reopenReason: "The bin was only half emptied and garbage spilled around the corner was left untouched."
    });

    await ComplaintImage.create({
      complaint: comp4._id,
      imageUrl: "/uploads/sample-garbage-before.svg",
      imageType: "BEFORE",
      uploadedBy: citizen._id
    });

    await ComplaintUpdate.create({
      complaint: comp4._id,
      user: citizen._id,
      status: "REOPENED",
      message: `Citizen Rahul Sharma reopened the complaint. Reason: "The bin was only half emptied and garbage spilled around the corner was left untouched."`
    });

    // Initial Notifications
    await Notification.create({
      recipient: citizen._id,
      type: "COMPLAINT_RESOLVED",
      title: "Complaint SC-2026-000003 Resolved",
      message: "Water Supply department has marked your complaint resolved. Please inspect Before/After photos and confirm.",
      complaint: comp3._id
    });

    await Notification.create({
      recipient: staffWaste._id,
      type: "COMPLAINT_REOPENED",
      title: "Complaint SC-2026-000004 Reopened",
      message: "Citizen reopened complaint regarding overflowing commercial bin. Action required.",
      complaint: comp4._id
    });

    await Notification.create({
      recipient: admin._id,
      type: "NEW_COMPLAINT",
      title: "New Civic Issue SC-2026-000001",
      message: "New Waste Management issue submitted at College Road, Nashik.",
      complaint: comp1._id
    });

    console.log("Seeding finished successfully!");
    console.log(`
=========================================
  DEMO CREDENTIALS:
=========================================
  Admin:
    Email:    admin@smartcity.local
    Password: Admin@123

  Staff (Waste Management):
    Email:    staff@smartcity.local
    Password: Staff@123

  Staff (Roads):
    Email:    staff.roads@smartcity.local
    Password: Staff@123

  Staff (Water Supply):
    Email:    staff.water@smartcity.local
    Password: Staff@123

  Citizen:
    Email:    citizen@smartcity.local
    Password: Citizen@123
=========================================
    `);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
}

seed();
