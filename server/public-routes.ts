import { Router } from 'express';
import { storage } from './storage'; // Adjust the import path as needed

const router = Router();

/**
 * @openapi
 * /public/condominiums/approved:
 *   get:
 *     summary: Retrieve a list of approved condominiums
 *     description: Fetches a list of all condominiums that have been approved and can be selected by new users during registration.
 *     tags:
 *       - Public
 *     responses:
 *       200:
 *         description: A list of approved condominiums.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: 
 *                     type: string
 *                     description: The condominium ID.
 *                   name:
 *                     type: string
 *                     description: The name of the condominium.
 *       500:
 *         description: Server error while fetching condominiums.
 */
router.get('/condominiums/approved', async (req, res) => {
    try {
        const condos = await storage.listApprovedCondominiums();
        res.status(200).json(condos);
    } catch (error) {
        console.error("Error fetching approved condominiums:", error);
        res.status(500).json({ message: "Failed to fetch approved condominiums" });
    }
});

export const publicRouter = router;
