const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



async function analyseIncident(monitorTitle, pings) {
    try {
        const prompt = `
                You are an expert site reliability engineer analysing uptime monitoring data.
                You will be given ping records for a service called "${monitorTitle}" from the last 24 hours.
                Each record contains: checked_at (timestamp), status_code (HTTP response code), error_log (error message if failed).
                Only failed pings are included.

                Analyse the failures and identify:
                - Patterns in timing, status codes, or error messages
                - Probable cause based on industry knowledge
                - Severity of the incident
                - Actionable suggestion to fix or investigate

                Return ONLY a valid JSON object with exactly these fields:
                {
                    "pattern": "string",
                    "probable_cause": "string", 
                    "severity": "low | medium | high",
                    "suggestion": "string"
                }
                The format of your response must be a JSON object only. Do not present response in a markdown, or include any text beyond the expected JSON object.
                Ping data: ${JSON.stringify(pings)}
            `
            
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config:  {
                responseMimeType: "application/json"
            }
        })

        const text = response.text; 
        console.dir(response, {depth: null});

        return JSON.parse(text);
    } 
    catch (err) {
        console.log(err);
        return {error: err.message};
        // if (err.message.includes('503') || err.message.includes('UNAVAILABLE')) {
        //     return { error: 'AI analysis unavailable at the moment. Please try again.' };
        // }
    }
}

module.exports = { analyseIncident };
