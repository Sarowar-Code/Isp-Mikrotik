# Isp Mikrotik web panel

## Multer and Cloudinary

Cloudinary is like aws service Which is use for storing files, actually its use aws behind the seen, and also its gives us many modifications of AWS. Just like a wrapper of aws.

Multer is a fileUploading pkg.

# The approuch of our project is,

At 1st we would take files and store them into our local server useing multer,
afterthat , cloudinary will take this file and upload to cloudinary server,

there are 2 steps,
1 .stored in local server, // so that we can reattepmt it.
2 .upload to cloud server

//

# **ISP Management System (CodersKite Super Admin Model — MERN + MikroTik API)**

## **🎯 Overview**

A MERN-based ISP automation platform where **CodersKite (Super Admin)** controls Admins (bandwidth sellers), who manage Resellers, who in turn manage PPP Clients (end users).
All PPPoE/Hotspot user management is handled via the **MikroTik RouterOS API**.

---

## **🛠 Roles & Responsibilities**

### **👑 CodersKite (Super Admin)**

- Creates & manages **Subscription Plans** (limit for PPP users, monthly cost)
- Creates & manages **Admin accounts** (bandwidth sellers)
- Assigns subscription plans to Admins
- Monitors all Admins, Resellers, Clients (usage, accounts, etc.)
- Can **suspend/ban Admins or Resellers**
- Manages billing system for Admins

---

### **🛡 Admin (Bandwidth Seller)**

- Created & controlled by CodersKite
- Gets a **subscription plan** from CodersKite
- Creates & manages **Resellers** under them
- Assigns **CodersKite-defined packages** to Resellers
- Cannot define custom subscription or packages

---

### **📦 Reseller (Bandwidth Reseller)**

- Created by Admin
- Can create & manage **PPP Clients**
- Can assign packages provided by Admin
- Manages billing & status of their clients

---

### **👥 PPP Clients (End Users)**

- Created by Resellers
- Credentials stored in **MikroTik (PPP Secret)**
- Package assigned by Reseller → synced to MikroTik

---

## **📊 System Workflow**

```
CodersKite (Super Admin)
    ↓ creates Subscription Plans + Bandwidth Packages
    ↓ creates Admins (Bandwidth Sellers)

Admin
    ↓ creates Resellers
    ↓ assigns CodersKite-defined packages to them

Reseller
    ↓ creates PPP Clients (end users)
    ↓ pushes them into MikroTik Router via API
```

---

✅ This summary now reflects **everything we worked on in this chat (Super Admin, Admin, Reseller, PPP Client + workflow)**.

Do you want me to also **make the ER diagram + workflow chart (roles, relationships, flow arrows)** so you can directly take it into your **new chat** as a visual starting point?
//
