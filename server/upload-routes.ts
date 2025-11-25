import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from './auth';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/upload - Handle image upload
router.post('/upload', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { image } = req.body; // Expects a base64 encoded image string

    if (!image) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    try {
        // Decode the base64 string
        // The string will look like "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...
        const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: 'Formato de imagem inválido.' });
        }

        const imageType = matches[1];
        const imageBuffer = Buffer.from(matches[2], 'base64');
        const fileExtension = imageType.split('/')[1] || 'jpg';
        const fileName = `${uuidv4()}.${fileExtension}`;

        // Define the path where the image will be saved
        const uploadPath = path.join(__dirname, '../../uploads', fileName);

        // Save the file
        fs.writeFile(uploadPath, imageBuffer, (err) => {
            if (err) {
                console.error("Erro ao salvar a imagem:", err);
                return res.status(500).json({ error: 'Falha ao salvar a imagem no servidor.' });
            }

            // Return the public URL of the uploaded image
            // The URL should be relative to the server's root
            const imageUrl = `/uploads/${fileName}`;
            res.status(201).json({ imageUrl });
        });

    } catch (error) {
        console.error("Erro no processamento da imagem:", error);
        res.status(500).json({ error: 'Erro interno ao processar a imagem.' });
    }
});

export const uploadRouter = router;
