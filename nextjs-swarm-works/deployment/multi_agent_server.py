#!/usr/bin/env python3
"""
Multi-Agent AI Server for Swarm Works
Provides 6 specialized AI agents: Code Review, Documentation, Test Generation, Performance, Security, and LLM Judge
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Swarm Works Multi-Agent AI Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama configuration
OLLAMA_BASE_URL = "http://localhost:11434"
CODE_MODEL = "tinyllama"  # For code review and documentation
ERNIE_MODEL = "ernie-4.5-0.3b"  # For test generation, performance, security, and judge

class AgentRequest(BaseModel):
    code: str
    language: Optional[str] = "python"
    context: Optional[str] = ""
    requirements: Optional[List[str]] = []

class AgentResponse(BaseModel):
    agent_type: str
    analysis: str
    suggestions: List[str]
    confidence: float
    execution_time: float

class OrchestratorRequest(BaseModel):
    code: str
    language: Optional[str] = "python"
    agents: List[str]
    context: Optional[str] = ""

class OrchestratorResponse(BaseModel):
    results: List[AgentResponse]
    summary: str
    overall_confidence: float

async def call_ollama(model: str, prompt: str) -> str:
    """Call Ollama API with the specified model and prompt"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "max_tokens": 1000
                    }
                }
            )
            if response.status_code == 200:
                return response.json()["response"]
            else:
                raise HTTPException(status_code=500, detail=f"Ollama API error: {response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling Ollama: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Swarm Works Multi-Agent AI Server",
        "version": "1.0.0",
        "agents": [
            "code-review",
            "documentation", 
            "test-generation",
            "performance",
            "security",
            "llm-judge"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Ollama connection
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                models = [model["name"] for model in response.json().get("models", [])]
                return {
                    "status": "healthy",
                    "ollama_connection": "ok",
                    "available_models": models
                }
            else:
                return {
                    "status": "degraded", 
                    "ollama_connection": "error",
                    "error": f"HTTP {response.status_code}"
                }
    except Exception as e:
        return {
            "status": "unhealthy",
            "ollama_connection": "error", 
            "error": str(e)
        }

@app.post("/agent/code-review", response_model=AgentResponse)
async def code_review_agent(request: AgentRequest):
    """Code Review Agent - analyzes code quality, patterns, and best practices"""
    import time
    start_time = time.time()
    
    prompt = f"""
You are a senior code reviewer. Analyze the following {request.language} code for:
1. Code quality and readability
2. Best practices adherence
3. Potential bugs or issues
4. Architecture and design patterns
5. Performance considerations

Code to review:
```{request.language}
{request.code}
```

Context: {request.context}

Provide specific, actionable feedback in a professional tone.
"""
    
    try:
        analysis = await call_ollama(CODE_MODEL, prompt)
        execution_time = time.time() - start_time
        
        # Extract suggestions from analysis
        suggestions = []
        if "suggestion" in analysis.lower() or "recommend" in analysis.lower():
            lines = analysis.split('\n')
            for line in lines:
                if any(word in line.lower() for word in ["suggest", "recommend", "should", "consider"]):
                    suggestions.append(line.strip())
        
        if not suggestions:
            suggestions = ["No specific suggestions found in analysis"]
            
        return AgentResponse(
            agent_type="code-review",
            analysis=analysis,
            suggestions=suggestions[:5],  # Limit to top 5
            confidence=0.85,
            execution_time=execution_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code review analysis failed: {str(e)}")

@app.post("/agent/documentation", response_model=AgentResponse)
async def documentation_agent(request: AgentRequest):
    """Documentation Agent - generates comprehensive documentation"""
    import time
    start_time = time.time()
    
    prompt = f"""
You are a technical documentation specialist. Generate comprehensive documentation for this {request.language} code:

Code:
```{request.language}
{request.code}
```

Context: {request.context}

Create documentation that includes:
1. Function/class descriptions
2. Parameter explanations
3. Return value descriptions
4. Usage examples
5. Important notes or warnings

Format the documentation in a clear, professional manner.
"""
    
    try:
        analysis = await call_ollama(CODE_MODEL, prompt)
        execution_time = time.time() - start_time
        
        suggestions = [
            "Add inline comments for complex logic",
            "Include usage examples in docstrings",
            "Document error conditions and exceptions",
            "Consider adding type hints",
            "Review parameter descriptions for clarity"
        ]
            
        return AgentResponse(
            agent_type="documentation",
            analysis=analysis,
            suggestions=suggestions,
            confidence=0.88,
            execution_time=execution_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Documentation generation failed: {str(e)}")

@app.post("/agent/test-generation", response_model=AgentResponse)
async def test_generation_agent(request: AgentRequest):
    """Test Generation Agent - creates comprehensive test cases using ERNIE"""
    import time
    start_time = time.time()
    
    prompt = f"""
You are a test automation expert. Generate comprehensive test cases for this {request.language} code:

Code:
```{request.language}
{request.code}
```

Context: {request.context}
Requirements: {request.requirements}

Create test cases that cover:
1. Happy path scenarios
2. Edge cases and boundary conditions
3. Error handling and exception cases
4. Integration test scenarios
5. Performance test considerations

Provide actual test code examples where possible.
"""
    
    try:
        analysis = await call_ollama(ERNIE_MODEL, prompt)
        execution_time = time.time() - start_time
        
        suggestions = [
            "Add unit tests for all public methods",
            "Include integration tests for external dependencies",
            "Test error handling and edge cases",
            "Add performance benchmarks",
            "Consider property-based testing for complex logic"
        ]
            
        return AgentResponse(
            agent_type="test-generation",
            analysis=analysis,
            suggestions=suggestions,
            confidence=0.92,
            execution_time=execution_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test generation failed: {str(e)}")

@app.post("/agent/performance", response_model=AgentResponse)
async def performance_agent(request: AgentRequest):
    """Performance Agent - analyzes performance bottlenecks using ERNIE"""
    import time
    start_time = time.time()
    
    prompt = f"""
You are a performance optimization expert. Analyze this {request.language} code for performance issues:

Code:
```{request.language}
{request.code}
```

Context: {request.context}

Identify and analyze:
1. Time complexity issues
2. Memory usage patterns
3. I/O bottlenecks
4. Database query optimization opportunities
5. Caching strategies
6. Algorithmic improvements

Provide specific optimization recommendations with examples.
"""
    
    try:
        analysis = await call_ollama(ERNIE_MODEL, prompt)
        execution_time = time.time() - start_time
        
        suggestions = [
            "Profile code execution to identify bottlenecks",
            "Consider algorithmic optimizations",
            "Implement caching for expensive operations",
            "Optimize database queries and indexes",
            "Use async/await for I/O bound operations"
        ]
            
        return AgentResponse(
            agent_type="performance",
            analysis=analysis,
            suggestions=suggestions,
            confidence=0.87,
            execution_time=execution_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance analysis failed: {str(e)}")

@app.post("/agent/security", response_model=AgentResponse)
async def security_agent(request: AgentRequest):
    """Security Agent - identifies security vulnerabilities using ERNIE"""
    import time
    start_time = time.time()
    
    prompt = f"""
You are a cybersecurity expert. Perform a security analysis of this {request.language} code:

Code:
```{request.language}
{request.code}
```

Context: {request.context}

Check for:
1. Input validation vulnerabilities
2. SQL injection risks
3. XSS vulnerabilities
4. Authentication and authorization issues
5. Data exposure risks
6. Cryptographic implementation issues
7. Dependency vulnerabilities

Provide specific security recommendations and mitigation strategies.
"""
    
    try:
        analysis = await call_ollama(ERNIE_MODEL, prompt)
        execution_time = time.time() - start_time
        
        suggestions = [
            "Implement input validation and sanitization",
            "Use parameterized queries to prevent SQL injection",
            "Apply principle of least privilege",
            "Implement proper error handling to avoid information disclosure",
            "Use secure cryptographic libraries and practices"
        ]
            
        return AgentResponse(
            agent_type="security",
            analysis=analysis,
            suggestions=suggestions,
            confidence=0.90,
            execution_time=execution_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Security analysis failed: {str(e)}")

@app.post("/agent/llm-judge", response_model=AgentResponse)
async def llm_judge_agent(request: AgentRequest):
    """LLM Judge Agent - provides overall assessment using ERNIE"""
    import time
    start_time = time.time()
    
    prompt = f"""
You are an expert AI judge evaluating code quality. Provide an overall assessment of this {request.language} code:

Code:
```{request.language}
{request.code}
```

Context: {request.context}

Provide a comprehensive evaluation covering:
1. Overall code quality score (1-10)
2. Strengths and positive aspects
3. Critical issues that need immediate attention
4. Priority recommendations
5. Comparison to industry best practices

Give balanced, constructive feedback suitable for code review.
"""
    
    try:
        analysis = await call_ollama(ERNIE_MODEL, prompt)
        execution_time = time.time() - start_time
        
        suggestions = [
            "Follow established coding standards",
            "Implement comprehensive error handling",
            "Add thorough documentation",
            "Include automated testing",
            "Consider code maintainability and readability"
        ]
            
        return AgentResponse(
            agent_type="llm-judge",
            analysis=analysis,
            suggestions=suggestions,
            confidence=0.89,
            execution_time=execution_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM judge analysis failed: {str(e)}")

@app.post("/orchestrator/analyze", response_model=OrchestratorResponse)
async def orchestrate_analysis(request: OrchestratorRequest):
    """Orchestrate multiple agents to analyze code"""
    import time
    import asyncio
    
    start_time = time.time()
    results = []
    
    # Map agent names to endpoints
    agent_map = {
        "code-review": code_review_agent,
        "documentation": documentation_agent,
        "test-generation": test_generation_agent,
        "performance": performance_agent,
        "security": security_agent,
        "llm-judge": llm_judge_agent
    }
    
    # Create agent requests
    agent_request = AgentRequest(
        code=request.code,
        language=request.language,
        context=request.context
    )
    
    # Run selected agents concurrently
    tasks = []
    for agent_name in request.agents:
        if agent_name in agent_map:
            tasks.append(agent_map[agent_name](agent_request))
    
    try:
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and calculate overall confidence
        valid_results = [r for r in results if isinstance(r, AgentResponse)]
        overall_confidence = sum(r.confidence for r in valid_results) / len(valid_results) if valid_results else 0.0
        
        # Generate summary
        summary = f"Analysis completed with {len(valid_results)} agents. "
        if overall_confidence > 0.8:
            summary += "High confidence in analysis results."
        elif overall_confidence > 0.6:
            summary += "Moderate confidence in analysis results."
        else:
            summary += "Low confidence - consider manual review."
            
        execution_time = time.time() - start_time
        summary += f" Total execution time: {execution_time:.2f}s"
        
        return OrchestratorResponse(
            results=valid_results,
            summary=summary,
            overall_confidence=overall_confidence
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "multi_agent_server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )