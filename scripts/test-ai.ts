import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_PROMPT = `Eres el asistente virtual de un despacho de abogados de inmigración con oficinas en: Houston, TX, Chicago, IL, Denver, CO, Nashville, TN.

Tu trabajo es:
1. Dar acuse inmediato y cálido
2. Clasificar la intención del usuario en: nueva_consulta | seguimiento | agendar | hablar_persona
3. Recoger: nombre, ciudad, descripción breve del caso (1-2 líneas)
4. NUNCA pedir: CURP, INE, pasaporte, tarjetas, cuentas bancarias, información médica, números de caso de USCIS/NVC, A-numbers, ni documentos sensibles
5. NUNCA dar consejo legal, interpretar leyes, predecir resultados ni opinar sobre casos
6. Si detectas: urgencia, deportación activa, detención, menor no acompañado, violencia, amenaza, o cualquier señal de peligro → HANDOFF INMEDIATO a humano
7. Si el usuario muestra frustración, enojo o insatisfacción → HANDOFF a humano
8. Si el usuario pide explícitamente hablar con persona → HANDOFF inmediato
9. Responde SIEMPRE en el idioma del usuario (español o inglés)
10. Máximo 2 mensajes de bot seguidos sin respuesta del usuario. Después: esperar.
11. Cada mensaje debe tener un propósito nuevo. Nunca repetir lo mismo.
12. Tono: profesional, cálido, breve. No emojis excesivos. Máximo 1-2 por mensaje.

Nombre de la firma: Law Offices of Manuel Solis.

Responde SOLAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks:
{
  "response_text": "texto para enviar al usuario",
  "intent": "nueva_consulta | seguimiento | agendar | hablar_persona",
  "should_handoff": boolean,
  "handoff_reason": "string or null",
  "qualification_score": 0-100,
  "detected_case_type": "string or null",
  "detected_urgency": "low | normal | high | critical",
  "suggested_office": "string or null",
  "next_action": "continue_bot | handoff_human | send_template | close"
}`;

interface TestCase {
  name: string;
  messages: Array<{ role: "user" | "model"; text: string }>;
  expect: {
    should_handoff?: boolean;
    urgency?: string;
    min_score?: number;
  };
}

const TEST_CASES: TestCase[] = [
  {
    name: "1. New inquiry (initial message)",
    messages: [
      {
        role: "user",
        text: "Hola, vengo del sitio web y quiero información sobre sus servicios.",
      },
    ],
    expect: { should_handoff: false },
  },
  {
    name: "2. Qualification info (follow-up with details)",
    messages: [
      {
        role: "user",
        text: "Hola, vengo del sitio web y quiero información sobre sus servicios.",
      },
      {
        role: "model",
        text: '{"response_text":"¡Hola! Gracias por contactarnos. Para ayudarte mejor, ¿podrías indicarme tu nombre, ciudad y una breve descripción de tu consulta?","intent":"nueva_consulta","should_handoff":false,"handoff_reason":null,"qualification_score":20,"detected_case_type":null,"detected_urgency":"low","suggested_office":null,"next_action":"continue_bot"}',
      },
      {
        role: "user",
        text: "Me llamo Juan Pérez, vivo en Houston y necesito ayuda con mi visa de trabajo H-1B que se vence en 2 meses.",
      },
    ],
    expect: { min_score: 40 },
  },
  {
    name: "3. Urgent case (ICE detention)",
    messages: [
      {
        role: "user",
        text: "Mi esposo fue detenido por ICE esta mañana, necesito ayuda urgente por favor",
      },
    ],
    expect: { should_handoff: true, urgency: "critical" },
  },
];

async function runTest(testCase: TestCase): Promise<boolean> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
    systemInstruction: SYSTEM_PROMPT,
  });

  const history = testCase.messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const lastMsg = testCase.messages[testCase.messages.length - 1];
  const start = Date.now();

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMsg.text);
  const elapsed = Date.now() - start;

  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error(`  FAIL: Could not parse JSON: ${text.substring(0, 200)}`);
    return false;
  }

  console.log(`  Response (${elapsed}ms):`);
  console.log(`    text: "${(parsed.response_text as string)?.substring(0, 100)}..."`);
  console.log(`    intent: ${parsed.intent}`);
  console.log(`    score: ${parsed.qualification_score}`);
  console.log(`    handoff: ${parsed.should_handoff} (reason: ${parsed.handoff_reason})`);
  console.log(`    urgency: ${parsed.detected_urgency}`);
  console.log(`    case_type: ${parsed.detected_case_type}`);
  console.log(`    office: ${parsed.suggested_office}`);

  // Validate expectations
  let pass = true;
  if (testCase.expect.should_handoff !== undefined && parsed.should_handoff !== testCase.expect.should_handoff) {
    console.log(`  FAIL: expected should_handoff=${testCase.expect.should_handoff}, got ${parsed.should_handoff}`);
    pass = false;
  }
  if (testCase.expect.urgency && parsed.detected_urgency !== testCase.expect.urgency) {
    console.log(`  FAIL: expected urgency=${testCase.expect.urgency}, got ${parsed.detected_urgency}`);
    pass = false;
  }
  if (testCase.expect.min_score !== undefined && (parsed.qualification_score as number) < testCase.expect.min_score) {
    console.log(`  FAIL: expected score >= ${testCase.expect.min_score}, got ${parsed.qualification_score}`);
    pass = false;
  }

  if (pass) console.log("  PASS");
  return pass;
}

async function main() {
  console.log("\n=== Gemini 2.0 Flash AI Qualification Test ===");
  console.log(`Model: gemini-2.0-flash`);
  console.log(`API Key: ${GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 8) + "..." : "NOT SET"}\n`);

  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("PLACEHOLDER")) {
    console.error("ERROR: Set GEMINI_API_KEY in .env.local first.");
    console.error("Get one at: https://aistudio.google.com/apikey");
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    console.log(`\n--- ${tc.name} ---`);
    try {
      const result = await runTest(tc);
      if (result) passed++;
      else failed++;
    } catch (err) {
      console.error(`  ERROR:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Passed: ${passed}/${TEST_CASES.length}`);
  console.log(`Failed: ${failed}/${TEST_CASES.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
