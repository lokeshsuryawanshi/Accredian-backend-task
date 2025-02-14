// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// Enable CORS (adjust configuration as needed)
app.use(cors());
app.use(express.json());

// Set up Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS, // Your Gmail App password or OAuth2 token
  },
});

// POST /api/referral endpoint to handle referral form submissions
app.post('/api/referral', async (req: Request, res: Response): Promise<void> => {
    const { referrerName, referrerEmail, refereeName, refereeEmail, courseName } = req.body;
  
    // Basic validation for required fields
    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail || !courseName) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }
  
    try {
      // Save referral data in the MySQL database via Prisma
      const referral = await prisma.referral.create({
        data: {
          referrerName,
          referrerEmail,
          refereeName,
          refereeEmail,
          courseName,
        },
      });
  
      // Prepare the referral email details
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: refereeEmail, // Sends email to the referee
        subject: 'You Have Been Referred to a Course!',
        text: `Hi ${refereeName},
  
  ${referrerName} thought you might be interested in the course "${courseName}". Check it out and start learning!
  
  Best regards,
  The Team`,
      };
  
      // Send the referral email using Gmail
      await transporter.sendMail(mailOptions);
  
      res.status(201).json({ message: 'Referral submitted successfully.', referral });
    } catch (error: any) {
      console.error('Error processing referral:', error);
      res.status(500).json({ message: 'An error occurred while processing your referral.' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
