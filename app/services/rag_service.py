"""
RAG (Retrieval-Augmented Generation) Service for document processing and vector search
"""

import os
import tempfile
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import UploadFile
import chromadb
from sentence_transformers import SentenceTransformer
import tiktoken
from pypdf import PdfReader
from docx import Document
import mimetypes

from app.models.innovation import DocumentUploadResponse, InnovationPhase
from app.utils.logging import get_logger

logger = get_logger(__name__)

class RAGService:
    """Service for RAG operations including document upload, processing, and vector search"""
    
    def __init__(self):
        # Initialize ChromaDB client
        self.chroma_client = chromadb.PersistentClient(path="./data/chroma")
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize tokenizer for text chunking
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        
        # Create collections for different phases
        self._initialize_collections()
    
    def _initialize_collections(self):
        """Initialize ChromaDB collections for each phase"""
        try:
            self.identify_collection = self.chroma_client.get_or_create_collection(
                name="identify_phase_docs",
                metadata={"description": "Documents for IDENTIFY phase analysis"}
            )
            
            self.invent_collection = self.chroma_client.get_or_create_collection(
                name="invent_phase_docs", 
                metadata={"description": "Documents for INVENT phase analysis"}
            )
            
            self.implement_collection = self.chroma_client.get_or_create_collection(
                name="implement_phase_docs",
                metadata={"description": "Documents for IMPLEMENT phase analysis"}
            )
            
            logger.info("ChromaDB collections initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing ChromaDB collections: {str(e)}")
            raise
    
    async def upload_document(
        self, 
        file: UploadFile, 
        session_id: str, 
        phase: InnovationPhase
    ) -> DocumentUploadResponse:
        """Upload and process a document for RAG"""
        
        try:
            # Generate document ID
            document_id = f"{session_id}_{phase}_{file.filename}_{int(datetime.utcnow().timestamp())}"
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_path = temp_file.name
            
            try:
                # Get file type from filename extension
                file_type, _ = mimetypes.guess_type(file.filename)
                if not file_type:
                    file_type = "application/octet-stream"
                
                # Extract text based on file type
                if file_type == "application/pdf":
                    text_content = self._extract_pdf_text(temp_path)
                elif file_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
                    text_content = self._extract_docx_text(temp_path)
                elif file_type.startswith("text/"):
                    with open(temp_path, 'r', encoding='utf-8') as f:
                        text_content = f.read()
                else:
                    raise ValueError(f"Unsupported file type: {file_type}")
                
                # Chunk the text
                chunks = self._chunk_text(text_content)
                
                # Generate embeddings for chunks
                embeddings = self.embedding_model.encode(chunks).tolist()
                
                # Get appropriate collection
                collection = self._get_collection_for_phase(phase)
                
                # Store in vector database
                chunk_ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
                metadatas = [
                    {
                        "document_id": document_id,
                        "session_id": session_id,
                        "phase": phase,
                        "filename": file.filename,
                        "chunk_index": i,
                        "file_type": file_type,
                        "upload_timestamp": datetime.utcnow().isoformat()
                    }
                    for i in range(len(chunks))
                ]
                
                collection.add(
                    ids=chunk_ids,
                    embeddings=embeddings,
                    documents=chunks,
                    metadatas=metadatas
                )
                
                return DocumentUploadResponse(
                    document_id=document_id,
                    filename=file.filename,
                    file_size=len(content),
                    document_type=file_type,
                    processing_status="completed",
                    chunk_count=len(chunks),
                    upload_timestamp=datetime.utcnow()
                )
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                
        except Exception as e:
            logger.error(f"Error uploading document {file.filename}: {str(e)}")
            return DocumentUploadResponse(
                document_id=document_id if 'document_id' in locals() else "error",
                filename=file.filename,
                file_size=len(content) if 'content' in locals() else 0,
                document_type="unknown",
                processing_status="failed",
                upload_timestamp=datetime.utcnow()
            )
    
    async def search_documents(
        self,
        query: str,
        session_id: Optional[str] = None,
        phase: Optional[InnovationPhase] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Search for relevant document chunks"""
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query]).tolist()[0]
            
            # Determine which collections to search
            collections_to_search = []
            if phase:
                collections_to_search.append(self._get_collection_for_phase(phase))
            else:
                collections_to_search = [
                    self.identify_collection,
                    self.invent_collection, 
                    self.implement_collection
                ]
            
            results = []
            for collection in collections_to_search:
                # Build filter criteria
                where_filter = {}
                if session_id:
                    where_filter["session_id"] = session_id
                
                # Search collection
                search_results = collection.query(
                    query_embeddings=[query_embedding],
                    n_results=top_k,
                    where=where_filter if where_filter else None
                )
                
                # Format results
                for i, (doc, metadata, distance) in enumerate(zip(
                    search_results['documents'][0],
                    search_results['metadatas'][0], 
                    search_results['distances'][0]
                )):
                    results.append({
                        "content": doc,
                        "metadata": metadata,
                        "relevance_score": 1 - distance,  # Convert distance to similarity
                        "collection": collection.name
                    })
            
            # Sort by relevance and return top results
            results.sort(key=lambda x: x['relevance_score'], reverse=True)
            return results[:top_k]
            
        except Exception as e:
            logger.error(f"Error searching documents with query '{query}': {str(e)}")
            return []
    
    async def get_document_context(
        self,
        session_id: str,
        phase: InnovationPhase,
        max_chunks: int = 10
    ) -> str:
        """Get relevant context from uploaded documents for a specific phase"""
        
        try:
            collection = self._get_collection_for_phase(phase)
            
            # Get all chunks for this session and phase
            results = collection.get(
                where={"session_id": session_id},
                limit=max_chunks
            )
            
            if not results['documents']:
                return ""
            
            # Combine chunks into context
            context_parts = []
            for doc, metadata in zip(results['documents'], results['metadatas']):
                context_parts.append(f"From {metadata['filename']}: {doc}")
            
            return "\n\n".join(context_parts)
            
        except Exception as e:
            logger.error(f"Error getting document context for session {session_id}: {str(e)}")
            return ""
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                reader = PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            return ""
    
    def _extract_docx_text(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {str(e)}")
            return ""
    
    def _chunk_text(self, text: str, max_tokens: int = 500, overlap_tokens: int = 50) -> List[str]:
        """Chunk text into smaller pieces for embedding"""
        
        # Tokenize the text
        tokens = self.tokenizer.encode(text)
        
        chunks = []
        start = 0
        
        while start < len(tokens):
            # Calculate end position
            end = min(start + max_tokens, len(tokens))
            
            # Extract chunk tokens
            chunk_tokens = tokens[start:end]
            
            # Decode back to text
            chunk_text = self.tokenizer.decode(chunk_tokens)
            chunks.append(chunk_text)
            
            # Move start position with overlap
            start = end - overlap_tokens
            
            # Break if we're at the end
            if end >= len(tokens):
                break
        
        return chunks
    
    def _get_collection_for_phase(self, phase: InnovationPhase):
        """Get the appropriate ChromaDB collection for a phase"""
        
        if phase == InnovationPhase.IDENTIFY:
            return self.identify_collection
        elif phase == InnovationPhase.INVENT:
            return self.invent_collection
        elif phase == InnovationPhase.IMPLEMENT:
            return self.implement_collection
        else:
            raise ValueError(f"Unknown phase: {phase}")
    
    async def list_documents(self, session_id: str) -> List[Dict[str, Any]]:
        """List all documents uploaded for a session"""
        
        try:
            all_docs = []
            
            for collection in [self.identify_collection, self.invent_collection, self.implement_collection]:
                results = collection.get(where={"session_id": session_id})
                
                # Group by document_id to avoid duplicates
                doc_groups = {}
                for metadata in results['metadatas']:
                    doc_id = metadata['document_id']
                    if doc_id not in doc_groups:
                        doc_groups[doc_id] = {
                            "document_id": doc_id,
                            "filename": metadata['filename'],
                            "phase": metadata['phase'],
                            "file_type": metadata['file_type'],
                            "upload_timestamp": metadata['upload_timestamp'],
                            "chunk_count": 0
                        }
                    doc_groups[doc_id]["chunk_count"] += 1
                
                all_docs.extend(doc_groups.values())
            
            return all_docs
            
        except Exception as e:
            logger.error(f"Error listing documents for session {session_id}: {str(e)}")
            return []
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and all its chunks"""
        
        try:
            for collection in [self.identify_collection, self.invent_collection, self.implement_collection]:
                # Get all chunk IDs for this document
                results = collection.get(where={"document_id": document_id})
                
                if results['ids']:
                    collection.delete(ids=results['ids'])
                    logger.info(f"Deleted {len(results['ids'])} chunks for document {document_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {str(e)}")
            return False
