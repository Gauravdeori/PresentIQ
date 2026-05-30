const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export interface AttendanceStats {
  className: string;
  totalStudents: number;
  defaulters: number;
  criteria: number;
  studentData: {
    name: string;
    percentage: number;
  }[];
}

export async function generateAIInsight(stats: AttendanceStats): Promise<string> {
  const prompt = `
    You are an AI assistant for a teacher. Analyze the following attendance data for a class.
    
    Class Name: ${stats.className}
    Total Students: ${stats.totalStudents}
    Defaulters (below ${stats.criteria}%): ${stats.defaulters}
    Criteria: ${stats.criteria}%
    
    Student Data:
    ${JSON.stringify(stats.studentData, null, 2)}
    
    Task: Write a short, professional 2-3 sentence summary/insight for the teacher. 
    Highlight the overall performance, mention if the class is doing well, and optionally point out if specific students are severely falling behind without listing every single name.
    
    Keep it concise, encouraging but professional, and suitable to be printed on a formal Attendance Report PDF.
    DO NOT use markdown formatting like asterisks or bullet points. Just plain text.
  `;

  try {
    // We check if the key has the correct format for OpenRouter (often starts with sk-or-v1-), 
    // but we use exactly what is in the env to be safe.
    let apiKey = OPENROUTER_API_KEY;
    if (apiKey && !apiKey.startsWith('sk-or-v1-') && apiKey.length > 50) {
      apiKey = \`sk-or-v1-\${apiKey}\`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${apiKey}\`,
        "HTTP-Referer": window.location.origin, 
        "X-Title": "PresentIQ",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3-8b-instruct:free",
        "messages": [
          { "role": "user", "content": prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      throw new Error(\`API returned status \${response.status}\`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Failed to generate AI insight:", error);
    return "AI Insight could not be generated at this time.";
  }
}
