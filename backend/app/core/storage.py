import json
from typing import List, Dict, Optional
from pathlib import Path

from app.schemas.analysis import AnalysisResponse


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
ANALYSES_FILE = DATA_DIR / "analyses.json"


class Storage:
    def __init__(self):
        self.analyses_file = ANALYSES_FILE
        self.chat_history_file = DATA_DIR / "chat_history.json"
        self._ensure_data_dir()
        self.analyses: List[AnalysisResponse] = self._load_analyses()
        self.chat_sessions: Dict[str, List[Dict]] = self._load_chat_history()

    def _ensure_data_dir(self):
        DATA_DIR.mkdir(exist_ok=True)
        if not self.analyses_file.exists():
            self.analyses_file.write_text("[]")
        if not self.chat_history_file.exists():
            self.chat_history_file.write_text("{}")

    def _load_chat_history(self) -> Dict[str, List[Dict]]:
        try:
            with self.chat_history_file.open("r") as f:
                return json.load(f)
        except Exception as e:
            print("Failed to load chat history:", e)
            return {}

    def save_chat_message(self, user_id: str, message: Dict):
        if user_id not in self.chat_sessions:
            self.chat_sessions[user_id] = []
        self.chat_sessions[user_id].append(message)
        self._persist_chats()

    def get_chat_history(self, user_id: str) -> List[Dict]:
        return self.chat_sessions.get(user_id, [])

    def _persist_chats(self):
        with self.chat_history_file.open("w") as f:
            json.dump(self.chat_sessions, f, indent=2)

    def _load_analyses(self) -> List[AnalysisResponse]:
        try:
            with self.analyses_file.open("r") as f:
                data = json.load(f)
                return [AnalysisResponse(**item) for item in data]
        except Exception as e:
            print("Failed to load analyses:", e)
            return []

    def save_analysis(self, analysis: AnalysisResponse):
        self.analyses.append(analysis)
        self._persist()

    def _persist(self):
        with self.analyses_file.open("w") as f:
            # Pydantic v2 uses model_dump. Use dict() for compatibility but model_dump is preferred.
            json.dump([a.model_dump() if hasattr(a, "model_dump") else a.dict() for a in self.analyses], f, indent=2)

    def get_all_analyses(self, user_id: Optional[str] = None) -> List[AnalysisResponse]:
        if not user_id:
            return self.analyses
        return [a for a in self.analyses if a.user_id == user_id]

    def get_analysis_by_id(self, analysis_id: str, user_id: Optional[str] = None) -> Optional[AnalysisResponse]:
        analysis = next(
            (a for a in self.analyses if a.analysis_id == analysis_id),
            None,
        )
        if analysis and user_id and analysis.user_id != user_id:
            return None
        return analysis

    def get_stats(self, user_id: Optional[str] = None) -> Dict:
        user_analyses = self.get_all_analyses(user_id)
        total = len(user_analyses)

        if total == 0:
            return {
                "total_analyses": 0,
                "total_investors": 0,
                "total_evidence": 0,
                "avg_score": "0%",
            }

        total_investors = sum(len(a.recommended_investors) for a in user_analyses)
        total_evidence = sum(len(a.evidence_used) for a in user_analyses)
        avg_score = sum(a.overall_score for a in user_analyses) / total

        return {
            "total_analyses": total,
            "total_investors": total_investors,
            "total_evidence": total_evidence,
            "avg_score": f"{int(avg_score)}%",
        }

    def get_all_evidence(self, user_id: Optional[str] = None) -> List[Dict]:
        seen_titles = set()
        all_ev = []
        
        user_analyses = self.get_all_analyses(user_id)

        for a in user_analyses:
            for ev in a.evidence_used:
                if ev.title not in seen_titles:
                    all_ev.append(ev.model_dump() if hasattr(ev, "model_dump") else ev.dict())
                    seen_titles.add(ev.title)

        return all_ev

    def get_intelligence_library(self) -> List[Dict]:
        from app.data.evidence_store import EvidenceStore
        store = EvidenceStore()
        all_units = store.list_all_evidence(limit=50)
        return [u.model_dump() for u in all_units]


storage = Storage()
