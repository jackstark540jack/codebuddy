import express from 'express';
import cors from 'cors';
import { Together } from 'together-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const together = new Together({
  auth: process.env.VITE_TOGETHER_API_KEY
});

app.post('/api/generate-task', async (req, res) => {
  try {
    const { subject, difficulty } = req.body;

    const prompt = `Generate a coding challenge for ${subject} at ${difficulty} level. Include:
    - Title
    - Description
    - Starter code
    - Example solution
    Format as JSON with the following structure:
    {
      "title": "Challenge title",
      "description": "Detailed description",
      "difficulty": "${difficulty}",
      "subject": "${subject}",
      "starterCode": "Initial code template"
    }`;

    const response = await together.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1,
      stop: ["<|eot_id|>", "<|eom_id|>"]
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response');
    }

    res.json({ content: response.choices[0].message.content });
  } catch (error) {
    console.error('Error generating task:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evaluate-code', async (req, res) => {
  try {
    const { task, code, cssCode } = req.body;

    const prompt = `Evaluate this ${task.subject} code for the following task:
    
Task: ${task.title}
Description: ${task.description}

Student's Code:
${code}
${cssCode ? `CSS Code:\n${cssCode}` : ''}

Provide feedback in JSON format with exactly this structure:
{
  "score": <number between 0 and 100>,
  "feedback": "detailed explanation of the evaluation",
  "suggestions": ["improvement point 1", "improvement point 2", ...]
}`;

    const response = await together.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1,
      stop: ["<|eot_id|>", "<|eom_id|>"]
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response');
    }

    res.json({ content: response.choices[0].message.content });
  } catch (error) {
    console.error('Error evaluating code:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});