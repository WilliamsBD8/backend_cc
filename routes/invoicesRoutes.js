import express from "express";

const router = express.Router();

import { getInvoices, getInvoice, created, updated } from "../controllers/invoicesController.js";

// Auhtenticate, Register and confirm user

router.get('/', getInvoices)
router.get('/edit/:_id', getInvoice)
router.post('/', created);
router.post('/updated', updated);

export default router;