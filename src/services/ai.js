import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "../systemPrompt";

export const getUserMemory = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return [];

        const response = await fetch('/api/memory', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch memory:", error);
        return [];
    }
};

export const saveUserMemory = async (category, content) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch('/api/memory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ category, content })
        });
    } catch (error) {
        console.error("Failed to save memory:", error);
    }
};

export const generateResponse = async (apiKey, history, newMessage) => {
    if (!apiKey) {
        return "Please set your Groq API Key in the settings (Gear icon) to start chatting.";
    }

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    // Fetch Memory
    const memories = await getUserMemory();
    const memoryContext = memories.map(m => `- [${m.category}] ${m.content}`).join('\n');

    const enhancedSystemPrompt = `${SYSTEM_PROMPT}

    === USER LONG-TERM MEMORY ===
    ${memoryContext || "No prior context available."}
    
    INSTRUCTION: Use the above memory to personalize your response. If the user tells you a new important fact (e.g. "I moved to Berlin", "My salary is $5000"), reply normally but also output a special tag [MEMORY: category | content] at the end of your message so the system can save it.
    `;

    // Prepare history
    const conversationHistory = history
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));

    // Inject System Prompt
    const messages = [
        { role: "system", content: enhancedSystemPrompt },
        ...conversationHistory,
        { role: "user", content: newMessage }
    ];

    try {
        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile", // Updated to latest supported model
            temperature: 0.7,
            max_tokens: 1024,
        });

        const responseContent = completion.choices[0]?.message?.content || "No response generated.";

        // Check for memory tags and save them
        // Format: [MEMORY: Location | Moved to Berlin]
        const memoryMatch = responseContent.match(/\[MEMORY:\s*(.*?)\s*\|\s*(.*?)\]/);
        if (memoryMatch) {
            const [_, category, content] = memoryMatch;
            await saveUserMemory(category, content);
            // Clean the response
            return responseContent.replace(memoryMatch[0], '').trim();
        }

        return responseContent;
    } catch (error) {
        console.error("Groq AI Error:", error);
        return `**Connection Error**: Unable to connect to Groq. \n\nDetails: ${error.message || "Unknown error"}. \n\nPlease verify your API Key.`;
    }
};

export const analyzeExpenses = async (apiKey, csvData) => {
    if (!apiKey) throw new Error("API Key missing");

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const prompt = `
        You are a financial analyst. Analyze the following bank statement data (CSV format) and provide a structured JSON response.
        
        DATA:
        ${csvData.substring(0, 15000)} 
        
        INSTRUCTIONS:
        1. Categorize each transaction into one of these standard categories: Food, Transport, Rent/Housing, Utilities, Entertainment, Shopping, Income, Healthcare, Debt, Others.
        2. Calculate total spending and total income.
        3. Identify 3 key insights or spending habits.
        4. Flag any "risky" or unusual spending (e.g. gambling, overdraft fees, very high discretionary spend).
        
        OUTPUT FORMAT (Strict JSON):
        {
            "categories": [
                {"name": "Food", "value": 500, "color": "#FF8042", "details": "Eating out 5 times"},
                {"name": "Transport", "value": 200, "color": "#00C49F", "details": "Uber and Gas"}
            ],
            "total_spent": 1200,
            "total_income": 3000,
            "insights": ["High spending on dining out", "Transport costs increased"],
            "risky_spending": [{"date": "2024-01-01", "description": "Unknown", "amount": 500, "reason": "Unrecognized merchant"}]
        }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a JSON-only financial API. Output strict JSON. No markdown formatting." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("Expense Analysis Error:", error);
        throw new Error("Failed to analyze expenses. " + error.message);
    }
};

export const generateBudgetPlan = async (apiKey, { income, fixedCosts, goals }) => {
    if (!apiKey) throw new Error("API Key missing");

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const prompt = `
        You are an expert financial planner. Create a monthly budget plan based on the 50/30/20 rule (Needs/Wants/Savings) for the following user profile.
        
        USER DATA:
        - Monthly Income: ₹${income}
        - Fixed Costs (Needs): ₹${fixedCosts}
        - Financial Goals: ${goals}
        
        INSTRUCTIONS:
        1. Calculate the ideal 50/30/20 split based on the income.
        2. Compare valid fixed costs against the 50% "Needs" bucket.
        3. Adjust the plan if fixed costs exceed 50% (reduce wants first).
        4. Provide specific, actionable advice to achieve the stated goals.
        
        OUTPUT FORMAT (Strict JSON):
        {
            "allocations": [
                {"name": "Needs", "value": 1500, "limit": 1500, "color": "#0088FE", "description": "Rent, Bills, Groceries"},
                {"name": "Wants", "value": 900, "limit": 900, "color": "#FFBB28", "description": "Dining, Entertainment"},
                {"name": "Savings", "value": 600, "limit": 600, "color": "#00C49F", "description": "Investments, Emergency Fund"}
            ],
            "analysis": "Your fixed costs are within the 50% limit. Great job!",
            "action_plan": [
                "Automate ₹5000 transfer to savings immediately upon payday.",
                "Review subscription services to optimize 'Wants' spending."
            ]
        }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a JSON-only financial API. Output strict JSON. No markdown." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("Budget Planning Error:", error);
        throw new Error("Failed to generate budget plan. " + error.message);
    }
};

export const generateGoalStrategy = async (apiKey, { name, amount, years, risk }) => {
    if (!apiKey) throw new Error("API Key missing");

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const prompt = `
        You are a certified financial planner. Create an investment strategy for a specific user goal.
        
        GOAL DETAILS:
        - Goal: ${name}
        - Target Amount: ₹${amount}
        - Timeline: ${years} years
        - Risk Tolerance: ${risk}
        
        INSTRUCTIONS:
        1. Calculate the estimated monthly contribution required to reach the target (assume reasonable annual returns based on risk: Low=5%, Med=8%, High=12%).
        2. Suggest an investment portfolio split (e.g., Equity Mutual Funds vs Debt/FDs vs Gold/Cash).
        3. Explain the "Why" behind the split.
        
        OUTPUT FORMAT (Strict JSON):
        {
            "monthly_savings_required": 5000,
            "estimated_return_rate": "12%",
            "investment_split": [
                {"type": "Equity (SIP)", "percentage": 60, "amount": 3000, "color": "#8884d8"},
                {"type": "Debt / FD", "percentage": 30, "amount": 1500, "color": "#00C49F"},
                {"type": "Gold / Cash", "percentage": 10, "amount": 500, "color": "#FFBB28"}
            ],
            "strategy_logic": "Given the 5-year timeline and medium risk, a 60/40 equity-debt split balances growth with stability.",
            "recommendations": [
                "Start a SIP of ₹3000 in an Index Fund.",
                "Open a Recurring Deposit for the stable portion."
            ]
        }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a JSON-only financial API. Output strict JSON. No markdown." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("Goal Strategy Error:", error);
        throw new Error("Failed to generate goal strategy. " + error.message);
    }
};

export const explainInvestmentConcept = async (apiKey, term) => {
    if (!apiKey) throw new Error("API Key missing");

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const prompt = `
        You are a friendly financial tutor. Explain the following investment term to a beginner.
        
        TERM: "${term}"
        
        INSTRUCTIONS:
        1. Define the term simply (no jargon).
        2. Provide a concrete numerical example (e.g., "If you invest ₹1000...").
        3. Assign a Risk Level (Low, Medium, High) and a corresponding color code.
        4. List 3 key takeaways.
        
        OUTPUT FORMAT (Strict JSON):
        {
            "term": "SIP (Systematic Investment Plan)",
            "definition": "A way to invest a fixed amount regularly (like monthly) in mutual funds, rather than a lump sum.",
            "example": {
                "scenario": "You invest ₹5000 every month for 10 years at 12% annual return.",
                "invested_amount": "₹6,00,000",
                "final_value": "₹11,61,700",
                "gain": "₹5,61,700"
            },
            "risk_level": "Medium",
            "risk_color": "#F59E0B",
            "takeaways": [
                "Disciplined investing habit.",
                "Reduces impact of market volatility (Rupee Cost Averaging).",
                "Great for long-term wealth creation."
            ]
        }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a JSON-only financial tutor. Output strict JSON. No markdown." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("Investment Explanation Error:", error);
        throw new Error("Failed to explain concept. " + error.message);
    }
};
