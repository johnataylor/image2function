
import OpenAI from "openai";
import fs from 'fs';


await createTextFromPng('C:\\data\\cache\\page10.png');


export async function createTextFromPng(pngFileName) {

  console.log(`createTextFromPng('${pngFileName}')`);

  const instructions = "Create a JSON description of this page."
  + " Use the tools provided to create the JSON.";

  const message = {
    role: "user",
    content: [
      { type: "text", text: instructions },
      { type: "image_url", image_url: { url: toBase64(pngFileName) } },
    ],
  };

  const tools = [
    {
      "type": "function",
      "function": {
        "name": "create_page_description",
        "description": "A function that creates a JSON description of the page.",
        "parameters": {
          "type": "object",
          "properties": {
            "pageHeader": {
              "type": "string",
              "description": "A page header if it has been given one."
            },
            "pagefooter": {
              "type": "string",
              "description": "A page footer if it has been given one."
            },
            "pageNumber": {
              "type": "string",
              "description": "A page number if it has been given one."
            },
            "description": {
              "type": "string",
              "description": "A summary description of the content of this page."
            },
            "keywords": {
              "type": "string",
              "description": "A comma delimited list of keywords that might be useful in finding this page with a search index."
            },
            "tables": {
              "type": "array",
              "description": "A array of table descriptions. Each table found on the page should be included in this array. Make sure to include every table found on the page. Make sure to include the contents of every table.",
              "items": {
                "type": "object",
                "properties": {
                  "tableTitle": {
                    "type": "string",
                    "description": "A title for the table if it has been given one."
                  },
                  "columnHeadings": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "description": "A column heading for the table.",
                    },
                    "description": "The set of column headings for the table.",
                  },
                  "tableData": {
                    "type": "array",
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "string",
                      },
                      "description": "Each element of this array represents an individual cell in the row.",
                    },
                    "description": "An array of all the data in the table. Each element of this array represents a row in the table.",
                  }
                }
              }
            }
          },
          "required": [ "description", "keywords" ]
        }
      }
    }];

  const openai = new OpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    max_tokens: 4096,
    messages: [ message ],
    tools: tools,
    tool_choice: {"type": "function", "function": {"name": "create_page_description"}}
  });

  // console.log(JSON.stringify(response, null, 2));

  if (response.choices[0].finish_reason == 'stop') {
    response.choices[0].message.tool_calls.forEach(tool_call => {
      const args = JSON.parse(tool_call.function.arguments);
      console.log(JSON.stringify(args, null, 2));
    });
  }
}

function toBase64(filePath) {
  const img = fs.readFileSync(filePath);
  return 'data:image/png;base64,' + Buffer.from(img).toString('base64');
}
