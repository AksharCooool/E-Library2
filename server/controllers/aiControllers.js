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
        // 1. Accept history and book details from the request
        const { message, history, pageContent, pageNumber, bookTitle, bookAuthor } = req.body; 

        if (!message && (!history || history.length === 0)) {
            return res.status(400).json({ error: "No message or history provided." });
        }

        const contextText = (pageContent && pageContent.trim().length > 0) 
            ? pageContent 
            : "No text content available for this page yet.";

        // 2. The "Brain" - A specialized system prompt for student reading
        const systemPrompt = `
You are an expert Academic AI Tutor assisting a student with the book: "${bookTitle}" by ${bookAuthor}.
CURRENT CONTEXT: You are looking at Page ${pageNumber}.
PAGE TEXT: "${contextText}"

INSTRUCTIONS:
1. CONTEXT: Always remember you are discussing "${bookTitle}". If the page text is vague, use your general knowledge of this book to help.
2. SUMMARIES: If the user asks for a summary, provide a structured breakdown with bold headers and bullet points. Focus on the most important academic takeaways.
3. CONVERSATION: Use the provided chat history to understand follow-up questions (e.g., if the user says "Explain that more," refer to your previous answer).
4. TONE: Be encouraging, concise, and professional.
5. LIMITS: If the page text is missing, politely ask the student to wait for the PDF to finish loading.
`;

        // 3. Build the message array for Groq (System + History + Current Message)
        // We ensure the history is mapped correctly to { role, content }
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
            temperature: 0.3, // Lower temperature for more factual/academic accuracy
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