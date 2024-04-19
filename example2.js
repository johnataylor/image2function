
import OpenAI from "openai";
import fs from 'fs';


await createTextFromPng('C:\\data\\cache\\page10.png');



export async function createTextFromPng(pngFileName) {

  console.log(`createTextFromPng('${pngFileName}')`);

  const instructions = "Create a JSON description of this page."
  + " Use the tools provided to create the JSON."
  + " Make sure to include every table or diagram you find on the page. You can use multiple tools or the same tool multiple times.";

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
        "name": "create_description_of_a_table",
        "description": "A function that creates a JSON description of an individual table. There maybe multiple tables, in which case call this function multiple times, once for each.",
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

  const openai = new OpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    max_tokens: 4096,
    messages: [ message ],
    tools: tools,
  });

  //console.log(JSON.stringify(response, null, 2));

  if (response.choices[0].finish_reason == 'tool_calls') {
    response.choices[0].message.tool_calls.forEach(tool_call => {
      console.log('>>>> ' + tool_call.function.name);
      const args = JSON.parse(tool_call.function.arguments);
      console.log(JSON.stringify(args, null, 2));
      console.log();
    });
  }
}

function toBase64(filePath) {
  const img = fs.readFileSync(filePath);
  return 'data:image/png;base64,' + Buffer.from(img).toString('base64');
}
