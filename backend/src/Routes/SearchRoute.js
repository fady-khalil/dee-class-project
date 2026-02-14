import express from "express";
import { search, getSuggestions } from "../Controllers/SearchController.js";

const router = express.Router();

router.get("/suggestions", getSuggestions);
router.get("/", search);

export default router;
