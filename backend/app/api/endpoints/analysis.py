from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from app.schemas.analysis import AnalysisRequest, AnalysisResponse, TranslationRequest
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.orchestrator import AnalysisOrchestrator
from app.core.chat_orchestrator import ChatOrchestrator
from app.generation.generator import Generator
from app.core.storage import storage


router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_funding_fit(
    request: AnalysisRequest,
    orchestrator: AnalysisOrchestrator = Depends(AnalysisOrchestrator),
):
    # API Layer:Entry point for startup analysis.

    try:
        result = await orchestrator.run_analysis(request)
        storage.save_analysis(result)
        return result
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=Dict)
async def get_stats(user_id: str = None):
    # for stats returning
    return storage.get_stats(user_id)


@router.get("/history", response_model=List[AnalysisResponse])
async def get_history(user_id: str = None):
    # recent anaylzusiis
    return storage.get_all_analyses(user_id)


@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str, user_id: str = None):
    # specifix analsiss
    analysis = storage.get_analysis_by_id(analysis_id, user_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.get("/evidence", response_model=List[Dict])
async def get_all_evidence(user_id: str = None):
    # unique evidenrces
    return storage.get_all_evidence(user_id)


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    orchestrator: ChatOrchestrator = Depends(ChatOrchestrator)
):
    
    #Multilingual Q&A endpoint for deep-diving into funding insights.
    
    try:
        response = await orchestrator.handle_chat(request)
        
        if request.user_id:
            storage.save_chat_message(request.user_id, {
                "role": "user",
                "content": request.message,
                "created_at": None 
            })
            storage.save_chat_message(request.user_id, {
                "role": "assistant",
                "content": response.answer,
                "sources": [s.model_dump() for s in response.sources] if response.sources else [],
                "created_at": None
            })
            
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/translate")
async def translate_text(
    request: TranslationRequest,
    generator: Generator = Depends(Generator)
):
    
    
    translated = await generator.translate(request.text, request.target_language)
    return {"translated_text": translated}
@router.get("/intelligence", response_model=List[Dict])
async def get_intelligence_library():
    
    
    return storage.get_intelligence_library()


@router.get("/chat/history", response_model=List[Dict])
async def get_chat_history(user_id: str):
    
    
    return storage.get_chat_history(user_id)
