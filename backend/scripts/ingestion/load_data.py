import os
import sys
import yaml
import json
import asyncio
import google.generativeai as genai
from datetime import datetime
from pathlib import Path

backend_dir = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
sys.path.append(backend_dir)

from app.config.settings import settings
from app.schemas.evidence import EvidenceUnit


class KnowledgeIngester:
    def __init__(self):
        self.raw_dir = Path(backend_dir) / "data" / "raw"
        self.pending_dir = Path(backend_dir) / "data" / "pending"
        self._ensure_dirs()

        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.model = genai.GenerativeModel("gemini-2.0-flash-exp")
        else:
            self.model = None

    def _ensure_dirs(self):
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.pending_dir.mkdir(parents=True, exist_ok=True)

    def validate_local_knowledge(self):
        """Scans data/raw and validates all evidence units."""
        print(f"[*] Starting Knowledge Base Audit...")
        files = list(self.raw_dir.glob("*.md"))
        valid_count = 0

        for file in files:
            try:
                content = file.read_text()
                parts = content.split("---")
                if len(parts) < 3:
                    print(f" [!] Skipping {file.name}: Missing frontmatter.")
                    continue

                metadata = yaml.safe_load(parts[1])

                EvidenceUnit(
                    evidence_id=f"ev_{file.stem}",
                    source_type=metadata.get("source_type", "news"),
                    title=metadata.get("title"),
                    source_name=metadata.get("source_name"),
                    published_year=metadata.get("published_year"),
                    url=metadata.get("source_url"),
                    sector=metadata.get("sector"),
                    content=parts[2].strip(),
                )
                valid_count += 1
                print(
                    f" [✓] Indexed: {metadata.get('title')} ({metadata.get('sector')})"
                )
            except Exception as e:
                print(f" [!] Error indexing {file.name}: {e}")

        print(
            f"[*] Audit Complete. {valid_count}/{len(files)} units are indexing for Deep Search."
        )

    async def discover_new_insights(self, query: str):
        """Uses Gemini to find and format new real-world insights."""
        if not self.model:
            print("[!] Discovery mode requires GOOGLE_API_KEY.")
            return

        print(f"[*] Discovery Mode: Searching for '{query}'...")

        prompt = (
            f"Search your internal knowledge for the latest 2024 funding news or policy updates "
            f"regarding: {query}.\n"
            f"Provide 1 REAL-WORLD evidence unit formatted as valid Markdown with YAML frontmatter.\n"
            f"Structure:\n"
            f"---\n"
            f"title: string\n"
            f"source_name: string\n"
            f"source_url: string (direct link)\n"
            f"published_year: 2024\n"
            f"sector: string\n"
            f"geography: string\n"
            f"source_type: news|policy|dataset\n"
            f"investors: [list]\n"
            f"usage_tags: [list from: market-sizing, regulation, funding-trends, investor-sentiment]\n"
            f"---\n"
            f"Content summary here..."
        )

        try:
            response = await self.model.generate_content_async(prompt)
            result = response.text.strip()

            if result.startswith("```"):

                lines = result.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]

                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                result = "\n".join(lines).strip()

            filename = (
                query.replace(" ", "_").lower()[:20]
                + f"_{datetime.now().strftime('%M%S')}.md"
            )
            filepath = self.raw_dir / filename

            filepath.write_text(result)
            print(f"[+] Successfully discovered and ingested: {filepath.name}")
        except Exception as e:
            print(f"[!] Discovery failed: {e}")


async def main():
    ingester = KnowledgeIngester()

    ingester.validate_local_knowledge()

    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        await ingester.discover_new_insights(query)
    else:
        print(
            "\n[TIP] Run 'python load_data.py <query>' to discover new real-time insights."
        )


if __name__ == "__main__":
    asyncio.run(main())
