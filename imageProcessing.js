
import OpenAI from "openai";
import fs from 'fs';

const openai = new OpenAI();

function toBase64(filePath) {
  const img = fs.readFileSync(filePath);
  return 'data:image/png;base64,' + Buffer.from(img).toString('base64');
}

export async function createTextFromPng(pngFileName, txtFileName) {

  console.log(`createTextFromPng('${pngFileName}', '${txtFileName}')`);

  const instructions = "Create a JSON description of this page."
  + " Use the tools provided to create the JSON."
  + " If there are multiple diagrams and tables make sure to call the appropriate tool for each.";

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
        "description": "A function that creates a structural representation of the page.",
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
              "description": "A page numbre if it has been given one."
            },
            "description": {
              "type": "string",
              "description": "A summary description of the content of this page."
            },
            "tables": {
              "type": "array",
              "description": "A description of each table found on the page.",
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
          }
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "create_description_of_a_table",
        "description": "A function that creates a description of an individual table. There maybe multiple tables, in which case call this function multiple times.",
        "parameters": {
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
          },
          "required": ["columnHeadings", "tableData"],
        },
      }
    }];

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    max_tokens: 4096,
    messages: [ message ],
    tools: tools,
    tool_choice: {"type": "function", "function": {"name": "create_page_description"}}
  });

  console.log(JSON.stringify(response, null, 2));

  //fs.writeFileSync(txtFileName, response.choices[0].message.content)

  // if (response.choices[0].finish_reason == 'tool_calls') {
  //   response.choices[0].message.tool_calls.forEach(tool_call => {
  //     console.log(tool_call.function.name);
  //     const args = JSON.parse(tool_call.function.arguments);
  //     console.log(JSON.stringify(args, null, 2));
  //   });
  // }

  response.choices[0].message.tool_calls.forEach(tool_call => {
    // console.log(tool_call.function.name);
    const args = JSON.parse(tool_call.function.arguments);
    console.log(JSON.stringify(args, null, 2));
  });
}
