type StringProp = {
    type: "string";
    description?: string;
    required?: boolean;
};

type NumberProp = {
    type: "number";
    description?: string;
    required?: boolean;
};

type BooleanProp = {
    type: "boolean";
    description?: string;
    required?: boolean;
};

export type ObjectProp = {
    type: "object";
    description?: string;
    required?: boolean;
    props: Record<string, ToolProp>;
};

type ArrayProp = {
    type: "array";
    description?: string;
    required?: boolean;
    children: ToolProp;
};

export type ToolProp = StringProp | NumberProp | BooleanProp | ObjectProp | ArrayProp | undefined;

/**
 * A validator is a function that takes the input properties of a tool and returns the
 * input properties if they are valid. If the input properties are invalid, the validator
 * returns a readable string that explains why the input properties are invalid, or it
 * throws an error. This is useful for validating the input properties of a tool before
 * calling the handler function.
 * 
 * @param props 
 * @throws {Error} If the input properties are invalid
 * @returns  The input properties if they are valid, or a readable string that explains why 
 * they are invalid
 * 
 * @example
 * 
 * const validateProps: Validator = (props) => {
 *    if (!props.email) {
 *      return "Email is required. Please enter an email address.";
 *    }
 *    
 *    if (!props.subject) {
 *       throw new Error("Subject is required. Please enter a subject.");
 *    }
 * 
 *    return props;
 *  }
 */
export type Validator = (props: Record<string, any>) => Record<string, any> | string;

/**
 * Tools provide your application with a way to call code. This lets you do things like
 * run a command, query a database, query an API, or run a script. This makes it easy to
 * build applications that can do things like send emails, display dashboards, or act
 * on behalf of a user.
 */
export type Tool = {
    /**
     * The unique identifier for the tool. This is used to reference the tool in your
     * application. It should be unique across all tools in your application. It should
     * also be meaningful and easy to remember, which will make it easier for the LLM to
     * understand the tool and use it in your application.
     * 
     * @example 
     * tool.id = "send-email"
     * tool.id = "query-database"
     * tool.id = "query-instagram-api"
     */
    id: string; // TODO: Move to tool.name instead of tool.id

    /**
     * This is the description of the tool. This should be a short, human-readable description
     * of what the tool does. This will help the LLM understand the tool and use it in your
     * application. You should also include any relevant information about the tool, such as
     * what it does, how it works, and what it is used for. This is also a good place to include
     * examples. Input/output pairs of examples are especially helpful for the LLM to understand
     * how the tool works and how it can be used in your application.
     * 
     * @example
     * 
     * # Send Email Tool
     * 
     * This is a tool that sends an email to a user. It takes an email address and a message and
     * sends an email to the user with the message. This is useful for sending notifications, alerts,
     * or other messages to users.
     * 
     * Input/Output Examples:
     * 
     * Input: { email: "john@person.com", subject: "Hello", message: "Hello, John!" }
     * Output: Email successfully sent to John with the message "Hello, John!"
     * 
     * Input: { email: "arun@gmail.com", subject: "Hi", message: "Hi, Arun!" }
     * Output: Email successfully sent to Arun with the message "Hi, Arun!"
     * 
     * Input: { email: "not-valid@yahoo", subject: "Yo", message: "Yo, sup!" }
     * Output: Email failed to send to not-valid@yahoo.com: Email address is not valid. Please enter a valid email address.
     * 
     */
    description: string;

    /**
     * The properties of the tool. This is a list of properties that the tool takes as input. Each
     * property should have a type, description, and whether it is required or not. This will help
     * the LLM understand how to use the tool and what input it needs to provide in order to use the
     * tool. The properties should be meaningful and easy to understand, which will make it easier
     * for the LLM to use the tool.
     * 
     * @example
     * 
     * props: {
     *   email: {
     *    type: "string",
     *    description: "The email address of the user to send the email to.",
     *    required: true
     *   }
     * }
     */
    props: ToolProp;

    /**
     * The handler function for the tool. This is the function that the tool will call when it is
     * used. The handler function should take the input properties of the tool as arguments and
     * return the output of the tool. This is where the logic of the tool should be implemented.
     *
     * It should always return a string or a Promise<string>. If structured data is needed, it should
     * be serialized to a string before returning it.
     * 
     * @example
     * 
     * handler: ({ number, exponent }) => {
     *  // calculate the exponent of the number
     *   return Math.pow(number, props);
     * }
     * 
     * @example
     * 
     * handler: async ({ email, subject, message }) => {
     *   // Send an email to the user with the message
     *   return await sendEmail(email, subject, message);
     * }
     * 
     */
    handler: (props: string) => string | Promise<string>;


    /**
     * The validation function for the tool. This is an optional function that can be used to validate
     * the input properties of the tool before the handler function is called. This is very useful
     * because LLMs can sometimes provide invalid input to the tool, which can cause the tool to fail.
     * By validating the input properties before calling the handler function, you can prevent the tool
     * from failing and provide a better user experience. If the tool fails, it can attempt to retry the tool with
     * valid input properties.
     * 
     * @see Validator for more information.
     */
    validateProps?: Validator
}