import express from "express";
import {
    modifyClaims,
    healthCheck,
} from "../controllers/modifierController.js";

const router = express.Router();

router.post("/modify", modifyClaims);
router.options("/modify", (_, res) => res.sendStatus(200));
router.get("/", healthCheck);

export default router;
