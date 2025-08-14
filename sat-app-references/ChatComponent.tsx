/*
import React, {useState, useContext, useEffect, useRef } from 'react';
import { PromptContext } from './PromptContext'; // Ensure the path is correct
import { UserContext } from './UserAndProfile/UserContext';
import { SpeechToTextComponent } from './SpeechToText'
import { Box, Button, Typography, TextField, useMediaQuery, useTheme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';


type ChatComponentProps = {
    isMissedQuestionReview?: boolean;
}

type Message = {
    role: 'system' | 'user'| 'assistant';
    content: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ isMissedQuestionReview = false }) => {
    const [userInput, setUserInput] = useState<string>('');
    const textareaRef = useRef<HTMLTextAreaElement>(null); //manages the sizes of teh userInput
    const [conversation, setConversation] = useState<Message[]>([]); //New on 11/15: includes system prompt in addition to user and assistant
    const [selectedModel, setSelectedModel] = useState<string>('gpt-4'); // New on 11/15: State for model selection

    const [error, setError] = useState<string>('');
    const [isGeneratingResponse, setIsGeneratingResposnse] = useState<boolean>(false);

    const { user } = useContext(UserContext);
    const context = useContext(PromptContext); // Access the generated SAT question and clearChat method from context
    //const generatedSATQuestion = context?.generatedSATQuestion || "";
    const generatedQuestion = context?.questionText || "";
    const generatedQuestionChoices = context?.choices || "";
    const generatedQuestionAnswer = context?.correctAnswer || "";
    const generatedQuestionExplanation = context?.explanationText || "";
    const skillsRequiringLatex = ['Absolute Value', 'Algebra', 'Circles', 'Exponential Equations', 'Exponential Word Problems', 'Geometry', 'Interpreting Graphs', 'Linear Equations', 'Linear Word Problems', 'Inequality Word Problems', 'Percent', 'Polynomial Expressions', 'Probability', 'Quadratic Equations', 'Quadratic Word Problems', 'Statistics', 'Systems of Equations', 'Trigonometry', 'Unit Conversions']
    const skillsRequiringHTMLTables = ['Interpreting Graphs', 'Referencing Data']
    const containsMath = skillsRequiringLatex.includes(context?.selectedSkill || '');
    const requiresHTMLTables = skillsRequiringHTMLTables.includes(context?.selectedSkill || '');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

    //********NEED TO FIGURE OUT WHY THIS SEEMS TO BE RE-RENDERING 3-4 TIMES PER QUESTION (is it because conditional variables re-render the whole thing? - bad for performance at scale) 
    // New on 11/15: System prompt to guide the AI's behavior. Customize the About Me section with information from UserContext soon.
    const systemPrompt = `You are Kai, an AI tutor specialized in helping high school students learn relevant core knowledge and test-taking strategies to solve Digital SAT problems. 
    Your responses should be easily understandable, short (50-120 words), supportive, and engaging for high school students. Ask the user questions to help develop their knowledge along the way, and share test-taking strategies relevant to the question.
    Generally, don't give the answer away unless the user explicitly asks for it; instead, lead the student's thinking with questions or a hint (i.e. one step forward in solving the problem). Don't ask more than 2 questions back to back unless the student's understanding requires further support or scaffolding.
    
    About Me, the high-school Student User: ${user ? `My name is ${user.firstName}. Use this information as context, but don't explicitly respond to it now: 
        My motivation for studying for the SAT: ${user.motivation}, and I'd like to attend these colleges ${user.colleges} and study ${user.intendedMajor}. 
        I like feedback to be ${user.feedbackStyle}.
        My goal score for the SAT is ${user.targetScores.readingWriting} for Reading and Writing and ${user.targetScores.math} for Math. Consider this when asked 'Which question types should I answer first'. Also, Word Choice, Punctuation, Linear Word Problems, and Quadratic Equations are the 4 most common question types.
    ${user.strengths ? `My strengths: ${user.strengths}` : ''}
    ${user.areasToImprove ? `Areas I could improve: ${user.areasToImprove}` : ''}
    ` : `I enjoy encouraging and insightful feedback. When asked 'Which question types should I answer first', recommend one of the 4 most common question types: Word Choice, Punctuation, Linear Word Problems, and Quadratic Equations, but also ask what the student is most interested in or where they enjoy practicing - because enthusiasm and motivation are important to leverage and celebrate!`} 
    
    ${containsMath ? 'Formatting: For all mathematical expressions, use LaTeX formatting with "$" before and after. Model your math process step by step on different lines with double line breaks in between. FOr each step, show the math expression first, then have 5 spaces ("     "), then include a concise explanation of what is happening in the step. Example: $y = \\frac{1}{2}x + 6$     First, we copy the equation down.\n\n$10 = \\frac{1}{2}x + 6$     Second, we plug in information given by the question, substituting $10$ for $y$.\n\n$4 = \\frac{1}{2}x$     Third, we subtract $6$ from both sides as we try to isolate $x$.\n\n$8 = x$     Finally, we multiplied both sides by $2$ to eliminate the fraction, leaving us with $8 = x$.' : ''}
    ${requiresHTMLTables ? 'Formatting: If you need to reference the table in any future chat, make sure to use HTML formatting. Example: <table border=\\"1\\"><tr><th>Group</th><th>Number of cans</th></tr><tr><td>1</td><td>30</td></tr><tr><td>2</td><td>63</td></tr><tr><td>3</td><td>38</td></tr><tr><td>4</td><td>50</td></tr><tr><td>5</td><td>47</td></tr><tr><td>6</td><td>40</td></tr><tr><td>7</td><td>54</td></tr><tr><td>8</td><td>60</td></tr><tr><td>9</td><td>18</td></tr><tr><td>10</td><td>20</td></tr></table>' : ''}
    `; //This is the end of the system prompt.

    //console.log(`systemPrompt is: ${systemPrompt}`);
    
    //Clears the Chat History by detecting chatCleared = true in PromptContext & conversation length > 0
    useEffect(() => {
        try{
            if (context?.chatCleared && conversation.length > 0) {
                setConversation([]); // Clear the conversation state
                //console.log("Cleared Conversation in ChatComponent's useEffect!!");
            }
        }
        catch (error){
            console.log ("Error in the useEffect of ChatComponent clearing Conversation: ", error)
        }
        
    }, [context?.chatCleared, conversation.length]); // Trigger effect whenever chatCleared flag changes

    // Array of optional prompts for quick input based on interactionStage. Added on 11/12

    let quickPrompts = [];
    if (isMissedQuestionReview){
        quickPrompts = ["What did I do wrong?",
        "What should I do differently next time?",
        "What's a test-taking strategy I could use here?",
        "Can you teach me the core knowledge / rule for this question type?"]
    } else {
        quickPrompts = context?.interactionStage === 'notStarted'
        ? ["Which question types should I practice first?",
            "What are common study mistakes?",
            "Can you tell me a joke and then inspire me to work hard?"]
        : context?.interactionStage === 'questionGenerated'
        ? ["Can you give me a hint to start?",
            "What's the key knowledge / strategy I should know?"]
            //"What's a test-taking strategy I could use here?"]
        : ["I don't get this. Can you explain how to solve this?",
            "What strategy could I have used?",
            //"Can you explain the key concepts?"
            ];
    }

    // NEW on 11/12 at 12:14 am: Event handler for quick prompt clicks
    const handleQuickPromptClick = (quickPrompt: string) => {
        //const finalPrompt = `${quickPrompt} ${generatedQuestion ? `Answer the user's prompt considering the current question the user is working on: Current SAT Question: ${generatedQuestion}. Answer Choices: ${generatedQuestionChoices}. 
          //      Correct Answer: ${generatedQuestionAnswer}. Official SAT Explanation: ${generatedQuestionExplanation}.`: ''}`;
        //console.log("handlingQuickPromptClick");
        setUserInput(quickPrompt); // Set the input field value to the selected prompt
        //console.log(`setUserInput to ${userInput}`);
        // Simulate a form submission with the quick prompt after updating the state
        setTimeout(() => {
            fetchChatResponse(quickPrompt); // Ensure prompt is passed correctly
        }, 0);
    };

    const handleSpeechToText = (text: string) => { //writes the transcription into the userInput
        setUserInput((prevInput) => {
            return prevInput ? `${prevInput} ${text}` : text;
        })
        console.log(`In handleSpeechToText in ChatComponent, text (transcript) is: ${text}`);
        }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserInput(e.target.value);
    }

    useEffect(() => { //adjusts the height of the textarea based on the userInput
        if (textareaRef.current) {
            // Reset height to calculate new content height
            textareaRef.current.style.height = "auto";
            // Set height to scrollHeight
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [userInput]); // Run whenever userInput changes

    // New on 11/15: Function to truncate conversation history for token management
    const getTruncatedConversation = (fullConversation: Message[], maxMessages: number = 10): Message[] => {
        // Filter out the system message
        const nonSystemMessages = fullConversation.filter(msg => msg.role !== 'system');
        const truncatedMessages = nonSystemMessages.slice(-maxMessages); //returns last 10 messages
        return [ { role: 'system', content: systemPrompt }, ...truncatedMessages ];
    };

    const fetchChatResponse = async(input: string = userInput): Promise<void> => { //the ": Promise<void>" declares that there is no return or output.
        setIsGeneratingResposnse(true);
        if (!input.trim()) return; //This is to prevent the user from sending empty messages.

        // Create the user message content that will be sent to the API, including context
        const userMessageContentForAPI = input + `${generatedQuestion ? 
            `Answer the user's question while implicitly referencing the context of the current SAT question:
            Current SAT Question: ${generatedQuestion}. 
            Answer Choices: ${generatedQuestionChoices}. 
            Correct Answer: ${generatedQuestionAnswer}. 
            Official SAT Explanation: ${generatedQuestionExplanation}.`: ''}`;
        
        // Create the user message object for the API
        const newUserMessageForAPI: Message = { role: 'user', content: userMessageContentForAPI };

        // This is the conversation history that forms the basis for the API call, including the latest user message with context
        const updatedConversationForAPI = [...conversation, newUserMessageForAPI];
        
        // Get the truncated list of messages to send to the API, including the system prompt
        const messagesForAPI = getTruncatedConversation(updatedConversationForAPI);
        
        // Create the user message object with only the raw input for display purposes
        const newUserMessageForDisplay: Message = { role: 'user', content: input };

        try{
            const res = await fetch('/api/chat', { //This is the fetch call to the backend. It's the same as the "response" in the back end.
                //https://my-react-openai-app.vercel.app is the production url, but the fetch should be the relative '/api/chat' for preview & production.
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messagesForAPI, //NEW on 11/15: sends conversation history with roles rather than 1 concatenated string, reducing AI's confusion on who sent which
                    model: selectedModel //will be useful later for specifying when to use regular vs. gpt-40-mini for summarization
                })
            });

            if (!res.ok){
                const errorData = await res.json();
                setError(errorData.error || 'Something went wrong. Look in the if(!res.ok) part of ChatComponent.js');
                setIsGeneratingResposnse(false);
                return;
            }

            const data = await res.json();
            const assistantMessage: Message = { role: 'assistant', content: data.content }; 
            
            // Update the conversation state for display:
            // Add the clean user message (newUserMessageForDisplay) and the assistant's response
            setConversation(prevConversation => [...prevConversation, newUserMessageForDisplay, assistantMessage]);
            
            setUserInput(''); //Clear input field after sending
            setIsGeneratingResposnse(false);

        } catch (error) {
            console.error('Error in the front-end fetchChatResponse catch: ', error)
            setError('Failed to fetch data from the server.');
            setUserInput(''); //Clear input field after sending
            setIsGeneratingResposnse(false);
        }
    };

    //***Any changes here should also be done where handleSubmit is called because currently if "Enter" is pressed instead of the Submit button, it just directly
    // calls e.preventDefault and fetchChatResponse. This is fine unless there is additional logic added here. 
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevents default form submission behavior
        fetchChatResponse(); // Calls the function to send the message
    };
    
    //Before 12/12/2024, the AI would say, "Hey, it's Kai, your AI tutor!"
    //Have you ever felt like you missed something in class but didn't want to ask?
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', p: 1 }}>          
      
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {quickPrompts.map((quickPrompt, index) => (
              <Button key={index} variant="outlined"
                onClick={() => handleQuickPromptClick(quickPrompt)}
                sx={{ textTransform: 'none', border: '2px solid', borderColor: 'primary.main', transform: 'scale 1.01', transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.01)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        bgcolor: 'action.hover'
                    }
                }}
              >
                <Typography variant="body1">{quickPrompt}</Typography>
              </Button>
            ))}
          </Box>
      
          <form onSubmit={handleSubmit} 
            style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}
          >
            {/* SpeechToTextComponent is not working on Apple phones as of 2/28/2025, so eliminating it on mobile for now.
            {isMobile ? null : <SpeechToTextComponent onTranscriptionUpdate={handleSpeechToText} />}

            <TextField inputRef={textareaRef} value={userInput} onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  fetchChatResponse(); //sends the chat message out.
                }
              }}
              placeholder={isMobile ? "Ask a question here!" : "Click the mic to talk or type your questions here! Ex: Can you explain ___?"}
              fullWidth multiline minRows={1} variant = "outlined"
              sx={{flexGrow: 1, 
                '& .MuiOutlinedInput-root': {borderRadius: 2, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  border: '2px solid', borderColor: 'divider', transition: 'all 0.2s ease-in-out',
                  '& fieldset': { border: 'none' },
                  '&:hover': { borderColor: 'primary.main' },
                  '&.Mui-focused': { borderColor: 'primary.main' }
                }
              }}
            />
            <Button type="submit" variant="contained"
              disabled={isGeneratingResponse}
              sx={{ minWidth: '60px' }}
            >
              {isGeneratingResponse ? <CircularProgress size={20} /> : 'Send'}
            </Button>
          </form>
      
          
            {conversation.length > 0 ? (
                <Box sx={{flexGrow: 1, overflowY: 'auto', p: 2,
                    border: '1px solid', borderColor: 'grey.300', borderRadius: 2, backgroundColor: 'background.default',  
                    boxShadow: conversation.length > 0 ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                >
                    {conversation.map((msg, index) => (
                        <Box key={index}
                            sx={{display: 'flex', flexDirection: 'column', mb: 1,
                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <Typography variant="body2" //body1 was previously here
                            sx={{
                                p: 1, borderRadius: 2, maxWidth: '90%', wordBreak: 'break-word',
                                color: msg.role === 'user' ? 'white' : 'text.primary',
                                backgroundColor: msg.role === 'user' ? '#007bff' : theme.palette.custom.green,
                                textAlign: msg.role === 'user' ? 'right' : 'left',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                '& *': { color: 'white' },
                                    lineHeight: 1.2, // Reduce line height
                                    margin: 0, // Remove margin
                                    '& p': { // Target any nested p elements
                                    margin: 0,
                                    padding: 0
                                    }
                            }}
                            >
                            {/*{msg.role === 'user' ? 'Your input prompt:' : 'AI Tutor\'s response:'}
                            {context?.renderLatexOrText(msg.content)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                ) :  null
                
            }
          {/*Formerly, in place of null above, we had: <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>No conversation yet.</Typography>
      
          {error && (
            <Typography variant="body2" sx={{ color: 'error.main', mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
    );
      
};
export default ChatComponent;

// ***Before 11/15 way of prompting without system prompts and by concatenating all conversation history into the userInput:
//Combine user input with the context from previous conversations
        //***********************************************************************************8 */
        //TO DO ON 11/14 or 15: Add in if it's the user or the ai associated with each message, have
        //If prevMessages gets longer than like 5, consider having a gpt message in the middle summarize the context of the first ones 
        /*   so only the most recent 4 messages are displayed 
        const prevMessages = conversation.map((msg) => msg.content).join(' ');
        const skillsRequiringLatex = ['Absolute Value', 'Algebra', 'Circles', 'Exponential Equations', 'Exponential Word Problems', 'Geometry', 'Interpreting Graphs', 'Linear Equations', 'Linear Word Problems', 'Inequality Word Problems', 'Percent', 'Polynomial Expressions', 'Probability', 'Quadratic Equations', 'Quadratic Word Problems', 'Statistics', 'Systems of Equations', 'Trigonometry', 'Unit Conversions']
        const skillsRequiringHTMLTables = ['Interpreting Graphs', 'Referencing Data']
        const containsMath = skillsRequiringLatex.includes(context?.selectedSkill || '');
        const requiresHTMLTables = skillsRequiringHTMLTables.includes(context?.selectedSkill || '');

        let prompt = "";

        if (prevMessages?.length === 0){
            prompt = `${input}`; 
            if (containsMath === true) {
                prompt = prompt + ' EXTREMELY IMPORTANT NOTE: All math expressions must use LaTeX formatting, with a "$" before and after. Example: $y = \\frac{2^{x+2}}{\\sqrt{2}}$. Before finishing your output, review all math expressions and add a "$" before and after (like $...$, not [...]) if they did not have "$" previously; if you do not, I cannot read your math explanations and will be extremely disappointed.';}
            if (requiresHTMLTables === true) {
                prompt = prompt + ' If you need to reference the table in any future chat, make sure to use HTML formatting. Example: <table border=\\"1\\"><tr><th>Group</th><th>Number of cans</th></tr><tr><td>1</td><td>30</td></tr><tr><td>2</td><td>63</td></tr><tr><td>3</td><td>38</td></tr><tr><td>4</td><td>50</td></tr><tr><td>5</td><td>47</td></tr><tr><td>6</td><td>40</td></tr><tr><td>7</td><td>54</td></tr><tr><td>8</td><td>60</td></tr><tr><td>9</td><td>18</td></tr><tr><td>10</td><td>20</td></tr></table>';}
            if (generatedQuestion?.length > 0) {
                prompt = prompt + `SAT Question: ${generatedQuestion}. Answer Choices: ${generatedQuestionChoices}. 
                    Correct Answer: ${generatedQuestionAnswer}. Official SAT Explanation: ${generatedQuestionExplanation}.`;}
        } else if (prevMessages?.length > 0) { //assuming there was a previous message. This should later become "else" and the bottom one shoudl be removed
            prompt = `${input}. Also, here is context from our previous messages. Always remember the SAT question, its answer choices, its explanation, and always follow all formatting instructions, but if you see a previous user question that was already answered, you can probably ignore it. 
            Before you complete your response, double check that the formatting is followed exactly: ${prevMessages}`
        } else {
            prompt = "Tell me that I'm a visionary and should push onward on despite failures and challenges."
        }
        //The "?" checks if there's a generatedSATQuestion. If so, adds it + choices + answer + explanation.
        if (prevMessages?.length > 0) {
            prompt = prompt + `Also, use context from our previous messages: ${prevMessages}`;}


            ...


            /*Old version before 11/15: 
            setConversation((previousConversation) => [
                ...previousConversation, 
                { role: 'user', content: input}, 
                { role: 'bot', content: data.content }]); //**Doesn't control for the data type without specifying ".content" 
                 
            ...
            //message: prompt //Old version: inludes userInput + context:updatedConversation. The backend will add the role: 'user' to this.
                */
        


 /*Old: Used to choose which quickPrompts are shown to user depending on if they've generated a question  (yes/no)
    useEffect(() => {
        if (generatedQuestion) {
            context?.setInteractionStage('questionGenerated');
        } else {
            context?.setInteractionStage('notStarted'); // Reset when no question is present
        }
    }, [generatedQuestion]); */



/* Old version:
    return (
        <div>
            <input 
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type your message here..."
                />                
            <button onClick={fetchChatResponse}>Send</button>
            
            <div>
                {conversation.map((msg, index) => (
                    <p key={index} style={{ color: msg.role === 'user' ? 'blue' : 'green' }}>
                        {msg.role === 'user' ? "Your input prompt: " : "AI Tutor's response: "}
                        {msg.content}
                    </p>
                ))}
            </div>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};
*/