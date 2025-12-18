import Groq from "groq-sdk";
import dotenv from "dotenv"; 

dotenv.config(); 

if (!process.env.GROQ_API_KEY) {
    console.error("ERROR: GROQ_API_KEY is missing in .env file!");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "" 
});

const AI_MODEL = 'llama-3.1-8b-instant'; 

export const chat = async (req, res) => {
    try {
        const { message, history, pageContent, pageNumber, bookTitle, bookAuthor } = req.body; 

        if (!message && (!history || history.length === 0)) {
            return res.status(400).json({ error: "No message or history provided." });
        }

        const contextText = (pageContent && pageContent.trim().length > 0) 
            ? pageContent 
            : "No text content available for this page yet.";

        // --- UPDATED SYSTEM PROMPT ---
        const systemPrompt = `
You are an expert Academic AI Tutor for "${bookTitle}" by ${bookAuthor}.
Current Page: ${pageNumber}
PAGE TEXT: "${contextText}"

INSTRUCTIONS:
1. Use Markdown formatting for ALL responses.
2. Use ### for section headers.
3. Use **bold text** for key terms or names.
4. Use bullet points (-) for lists or main takeaways.
5. If summarizing, create a "Key Points" section.
6. Keep paragraphs short (2-3 sentences max) to improve readability.
7. Use the provided chat history to understand follow-up questions.
8. If the PAGE TEXT is missing, politely ask the student to wait for the PDF to load.
`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.text
            })),
            { role: "user", content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            model: AI_MODEL, 
            messages: messages,
            temperature: 0.3, 
            max_tokens: 800,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "No reply from AI.";
        res.json({ reply });
    } catch (error) {
        console.error("Groq API Chat Error:", error.message);
        res.status(500).json({ error: "AI Failed.", details: error.message });
    }
};

export const generateSynopsis = async (req, res) => {
    try {
        const { title, author } = req.body; 
        if (!title || !author) {
            return res.status(400).json({ error: "Title and author required." });
        }

        const prompt = `Generate a 3-5 sentence synopsis for the book "${title}" by ${author}. Return ONLY the synopsis text.`;

        const chatCompletion = await groq.chat.completions.create({
            model: AI_MODEL, 
            messages: [{ role: "user", content: prompt }],
            temperature: 0.6, 
            max_tokens: 300 
        });

        const synopsis = chatCompletion.choices[0]?.message?.content || "Could not generate synopsis.";
        res.json({ synopsis });
    } catch (error) {
        console.error("Synopsis Error:", error.message);
        res.status(500).json({ error: "AI Failed.", details: error.message });
    }
};