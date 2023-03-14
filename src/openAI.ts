import { Configuration, OpenAIApi }  from 'openai' 
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);



export const getCompletion = async function (prompt: string) {
    if (!OPENAI_API_KEY) {
        console.error("OpenAI API key not configured, please follow instructions in README.md")
        return
    }
    try {
        // format the date as Mon-dd-yyyy
        const date = new Date()
        const month = date.toLocaleString('default', { month: 'short' })
        const day = date.getDate()
        const year = date.getFullYear()
        const formatted_date = `${month}-${day}-${year}`
        
        // format the prompt
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible. Knowledge cutoff Current date: ${formatted_date}
                `},
                {role: "user", content: prompt}
            ],
            temperature: 0.7,
            // max_tokens: 1000
        });
        console.log({ completion: completion})
        return completion
    } catch (error: any) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
            console.error(error.response.status, error.response.data);

        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
        }
    }
}