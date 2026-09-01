import express from "express";
import { ApplyResume, GetMyApplicationResult, GetPost } from "../controller/applicant.js";
import roleMiddleware from "../middleware/role.js";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router()

router.get('/posts', authMiddleware, roleMiddleware('applicant', 'admin'), GetPost)
router.get('/result', authMiddleware, roleMiddleware('applicant'), GetMyApplicationResult)
router.post("/apply/:postId", authMiddleware, roleMiddleware('applicant'),
  upload.fields([
    {
      name: "resume",
      maxCount: 1,
    },
    {
      name: "transcript",
      maxCount: 1,
    },
  ]),
  ApplyResume
);

export default router