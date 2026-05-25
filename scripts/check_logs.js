const fs = require('fs');
const readline = require('readline');

async function findModelResponses() {
  const filePath = 'C:/Users/aryan/.gemini/antigravity/brain/908cc91f-796b-4e33-a2ae-31f8bcef2f9b/.system_generated/logs/transcript.jsonl';
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const steps = [];
  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index >= 1440 && obj.step_index <= 1528) {
        steps.push(obj);
      }
    } catch (e) {}
  }

  console.log(`Found ${steps.length} steps.`);
  steps.forEach((step) => {
    console.log(`\n--- Step ${step.step_index} (${step.source} - ${step.type}) ---`);
    if (step.content) {
      console.log(step.content.substring(0, 1500));
    }
    if (step.tool_calls) {
      console.log('Tool Calls:', JSON.stringify(step.tool_calls, null, 2));
    }
  });
}

findModelResponses();
