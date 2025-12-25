import os
import yaml
import sys


sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.schemas.evidence import EvidenceUnit, SourceType
from app.data.evidence_store import EvidenceStore


def ingest_local_files(data_root: str = "data/raw"):
    """
    Scans the data/raw directory and indexes all markdown files into ChromaDB.
    """
    store = EvidenceStore()
    count = 0

    if not os.path.exists(data_root):
        print(f"[!] Data root {data_root} not found.")
        return

    print(f"[*] Starting ingestion from {data_root}...")

    for root, _, files in os.walk(data_root):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r") as f:
                        content = f.read()
                        if content.startswith("---"):
                            parts = content.split("---")
                            if len(parts) >= 3:
                                metadata = yaml.safe_load(parts[1])
                                body = parts[2].strip()

                                raw_tags = metadata.get(
                                    "usage_tags", ["local-ingestion"]
                                )
                                if isinstance(raw_tags, str):
                                    processed_tags = [
                                        t.strip() for t in raw_tags.split(",")
                                    ]
                                else:
                                    processed_tags = list(raw_tags)

                                raw_investors = metadata.get("investors", [])
                                if isinstance(raw_investors, str):
                                    processed_investors = [
                                        i.strip() for i in raw_investors.split(",")
                                    ]
                                else:
                                    processed_investors = list(raw_investors)

                                evidence = EvidenceUnit(
                                    evidence_id=f"ev_vec_{file.replace('.md', '')}",
                                    source_type=SourceType(
                                        metadata.get("source_type", "news")
                                    ),
                                    title=metadata.get("title", file),
                                    source_name=metadata.get(
                                        "source_name", "Local Intelligence"
                                    ),
                                    published_year=int(
                                        metadata.get("published_year", 2024)
                                    ),
                                    url=metadata.get("source_url"),
                                    sector=metadata.get("sector", "General"),
                                    geography=metadata.get("geography", "Global"),
                                    investors=processed_investors,
                                    content=body,
                                    usage_tags=processed_tags,
                                )

                                store.save_evidence(evidence)
                                count += 1
                                print(f"    [+] Indexed: {metadata.get('title')}")
                except Exception as e:
                    print(f"    [!] Failed to index {file}: {e}")

    print(f"[*] Ingestion complete. Total units added to Vector DB: {count}")


if __name__ == "__main__":
    ingest_local_files()
