import express from "express";
import {
    publicRoute,
    adminDashboard,
    studentPortal,
    coursesPortal,
    loginPage,
    issueToken,
    logout,
    decodeToken,
} from "../controllers/controllers.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/", publicRoute);
router.get("/login", loginPage);
router.post("/issue", issueToken);
router.post("/logout", logout);
router.post("/decode", decodeToken);
router.get("/university/admin/users", authenticate, adminDashboard);
router.post("/university/admin/users", authenticate, adminDashboard);
router.delete("/university/admin/users", authenticate, adminDashboard);
router.get("/university/students/grades", authenticate, studentPortal);
router.post("/university/students/grades", authenticate, studentPortal);
router.get("/university/students/courses", authenticate, coursesPortal);
router.post("/university/students/courses", authenticate, coursesPortal);
router.get("/university/admin/settings", authenticate, adminDashboard);

export default router;
