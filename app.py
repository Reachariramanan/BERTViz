from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModel
import torch

app = FastAPI()

MODEL_NAME = "answerdotai/ModernBERT-base"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME, output_attentions=True)
model.eval()

class AnalyzeRequest(BaseModel):
    sentence: str

class AnalyzeResponse(BaseModel):
    tokens: list[str]
    attention: list[list[list[float]]]

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    inputs = tokenizer(req.sentence, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    attentions = [att[0].mean(dim=0).tolist() for att in outputs.attentions]
    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    return {"tokens": tokens, "attention": attentions}
