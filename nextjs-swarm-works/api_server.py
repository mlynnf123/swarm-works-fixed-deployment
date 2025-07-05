from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
from typing import Optional
import asyncio

app = FastAPI(title="Swarm Works Lightweight AI API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 1024
    temperature: Optional[float] = 0.1
    task: Optional[str] = "analyze"

class CodeResponse(BaseModel):
    output: str
    task: str
    model: str
    tokens_used: int

# Use CodeGemma for code tasks, Phi for explanations
def select_model(task: str) -> str:
    if task in ["review", "test", "suggest"]:
        return "codegemma:2b"
    else:
        return "phi"  # Better for explanations

def format_prompt(prompt: str, task: str) -> str:
    templates = {
        "review": "Review this code for bugs and improvements:\n\n{code}",
        "explain": "Explain what this code does in simple terms:\n\n{code}",
        "test": "Write unit tests for this code:\n\n{code}",
        "suggest": "Suggest optimizations for this code:\n\n{code}",
        "analyze": "Analyze this code:\n\n{code}"
    }
    
    template = templates.get(task, templates["analyze"])
    return template.format(code=prompt)

@app.post("/api/ai/analyze", response_model=CodeResponse)
async def analyze_code(request: CodeRequest):
    try:
        model = select_model(request.task)
        formatted_prompt = format_prompt(request.prompt, request.task)
        
        # Call Ollama API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model,
                    "prompt": formatted_prompt,
                    "stream": False,
                    "options": {
                        "temperature": request.temperature,
                        "num_predict": request.max_tokens
                    }
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Model API error")
            
            result = response.json()
            
            return CodeResponse(
                output=result["response"],
                task=request.task,
                model=model,
                tokens_used=result.get("eval_count", 0)
            )
            
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Request timeout - try shorter code")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            models = response.json()
            return {
                "status": "healthy",
                "models": [m["name"] for m in models.get("models", [])],
                "memory_available": "2GB"
            }
    except:
        return {"status": "unhealthy", "error": "Ollama not responding"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
