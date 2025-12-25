from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.core.orchestrator import AnalysisOrchestrator
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
async def get_stats():
    # for stats returning
    return storage.get_stats()


@router.get("/history", response_model=List[AnalysisResponse])
async def get_history():
    # recent anaylzusiis
    return storage.get_all_analyses()


@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str):
    # specifix analsiss
    analysis = storage.get_analysis_by_id(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.get("/evidence", response_model=List[Dict])
async def get_all_evidence():
    # unique evidenrces
    return storage.get_all_evidence()
