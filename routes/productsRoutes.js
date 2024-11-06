import express from "express";

const router = express.Router();

import { getProducts, created, updated, getAll, getPaginate } from "../controllers/productsController.js";

// Auhtenticate, Register and confirm user

router.get('/', getProducts)
router.post('/all', getAll)
router.post('/', created)
router.post('/updated', updated)

router.post('/paginate', getPaginate)

export default router;