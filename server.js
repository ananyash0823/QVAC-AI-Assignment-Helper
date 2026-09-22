import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadModel, completion, unloadModel, LLAMA_3_2_1B_INST_Q4_0 } from "@qvac/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

let modelId = null;
let loadingPromise = null;

async function ensureModel() {
  if (modelId) return modelId;
  if (loadingPromise) return loadingPromise;

  loadingPromise = loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelType: "llamacpp-completion",
    modelConfig: {
      ctx_size: 2048,
      device: "cpu",
      gpu_layers: 0
    },
    onProgress: (p) => {
      if (p?.percentage !== undefined) {
        console.log(`QVAC model loading: ${Number(p.percentage).toFixed(0)}%`);
      }
    }
  }).then((id) => {
    modelId = id;
    loadingPromise = null;
    return id;
  }).catch((error) => {
    loadingPromise = null;
    throw error;
  });

  return loadingPromise;
}

app.get("/api/status", (_req, res) => {
  res.json({
    loaded: Boolean(modelId),
    sdk: "0.19.1",
    inference: "local"
  });
});

app.post("/api/solve", async (req, res) => {
  const question = String(req.body?.question || "").trim();
  const subject = String(req.body?.subject || "General").trim();

  if (!question) {
    return res.status(400).json({ error: "Please enter an assignment question." });
  }

  if (question.length > 12000) {
    return res.status(400).json({ error: "Question is too long. Keep it below 12,000 characters." });
  }

  try {
    const id = await ensureModel();

    const history = [{
      role: "user",
      content: `You are an offline college assignment helper.

Subject: ${subject}

Assignment question:
${question}

Give a clear educational answer. Structure it as:
1. Direct answer
2. Step-by-step explanation
3. Important points
4. Example or code if relevant
5. Short conclusion

Do not invent citations. If information is uncertain, say so.
Keep the response appropriate for a college student and easy to understand.`
    }];

    // Use QVAC's documented streaming completion pattern.
    // Generated text is emitted through run.tokenStream.
    const run = completion({
      modelId: id,
      history,
      stream: true
    });

    let answer = "";
    for await (const token of run.tokenStream) {
      answer += token;
    }

    if (!answer.trim()) {
      const final = await run.final;
      answer = final?.content ?? final?.text ?? "";
    }

    if (!answer.trim()) {
      throw new Error("QVAC completed without returning generated text.");
    }

    res.json({
      answer,
      local: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "QVAC local inference failed.",
      details: error?.message || String(error)
    });
  }
});

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

process.on("SIGINT", async () => {
  if (modelId) {
    try { await unloadModel({ modelId }); } catch {}
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`AI Assignment Helper: http://localhost:${PORT}`);
  console.log("Inference: local via QVAC. No cloud AI API is used.");
});