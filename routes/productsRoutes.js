import express from "express";

const router = express.Router();

import { getProducts, created, updated, getAll } from "../controllers/productsController.js";

// Auhtenticate, Register and confirm user

router.get('/', getProducts)
router.post('/all', getAll)
router.post('/', created)
router.post('/updated', updated)

export default router;