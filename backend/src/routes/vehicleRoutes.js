import express from 'express';
import { getMakes, getModels, getYears, getTrims } from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/makes', getMakes);
router.get('/models', getModels);
router.get('/years', getYears);
router.get('/trims', getTrims);

export default router;
