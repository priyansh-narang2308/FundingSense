import os
import yaml
import sys
from pypdf import PdfReader


sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.schemas.evidence import EvidenceUnit, SourceType
from app.data.evidence_store import EvidenceStore


def chunk_text(text, chunk_size=1500, overlap=200):

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += (chunk_size - overlap)
    return chunks

def extract_pdf_text(path):
 
    try:
        reader = PdfReader(path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"    [!] PDF Extraction Error ({os.path.basename(path)}): {e}")
        return None

def ingest_local_files(data_root: str = "data/raw"):
    """
    Scans the data/raw directory and indexes all markdown AND PDF files into ChromaDB.
    """
    store = EvidenceStore()
    count = 0

    if not os.path.exists(data_root):
        print(f"[!] Data root {data_root} not found.")
        return

    print(f"[*] Starting high-fidelity ingestion from {data_root}...")

    for root, _, files in os.walk(data_root):
        for file in files:
            file_path = os.path.join(root, file)
            

            if file.endswith(".md"):
                try:
                    with open(file_path, "r") as f:
                        content = f.read()
                        if content.startswith("---"):
                            parts = content.split("---")
                            if len(parts) >= 3:
                                metadata = yaml.safe_load(parts[1])
                                body = parts[2].strip()

                                raw_tags = metadata.get("usage_tags", ["local-ingestion"])
                                processed_tags = [t.strip() for t in raw_tags.split(",")] if isinstance(raw_tags, str) else list(raw_tags)
                                
                                raw_investors = metadata.get("investors", [])
                                processed_investors = [i.strip() for i in raw_investors.split(",")] if isinstance(raw_investors, str) else list(raw_investors)

                                evidence = EvidenceUnit(
                                    evidence_id=f"ev_vec_{file.replace('.md', '')}",
                                    source_type=SourceType(metadata.get("source_type", "news")),
                                    title=metadata.get("title", file),
                                    source_name=metadata.get("source_name", "Local Intelligence"),
                                    published_year=int(metadata.get("published_year", 2024)),
                                    url=metadata.get("source_url"),
                                    sector=metadata.get("sector", "General"),
                                    geography=metadata.get("geography", "Global"),
                                    investors=processed_investors,
                                    content=body,
                                    usage_tags=processed_tags,
                                )

                                store.save_evidence(evidence)
                                count += 1
                                print(f"    [+] Indexed Markdown: {metadata.get('title')}")
                except Exception as e:
                    print(f"    [!] Failed to index {file}: {e}")


            elif file.endswith(".pdf"):
                print(f"[*] Processing PDF: {file}")
                full_text = extract_pdf_text(file_path)
                if not full_text:
                    continue


                folder_name = os.path.basename(root)
                sector_hint = folder_name.capitalize() if folder_name not in ["raw", "policy", "datasets"] else "General"
                source_type = "policy" if "policy" in root.lower() else "dataset"

                chunks = chunk_text(full_text)
                for i, chunk in enumerate(chunks):
                    evidence = EvidenceUnit(
                        evidence_id=f"ev_pdf_{file.replace('.pdf', '')}_{i}",
                        source_type=SourceType(source_type),
                        title=f"{file} (Part {i+1})",
                        source_name="Official PDF Document",
                        published_year=2024,
                        sector=sector_hint,
                        geography="India",
                        content=chunk,
                        usage_tags=["pdf-ingestion", source_type]
                    )
                    store.save_evidence(evidence)
                    count += 1
                print(f"    [+] Indexed PDF: {file} ({len(chunks)} chunks)")

    print(f"[*] Ingestion complete. Total units added to Vector DB: {count}")


if __name__ == "__main__":
    ingest_local_files()
