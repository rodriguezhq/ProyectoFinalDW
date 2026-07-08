from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SolicitarDocumentoBody(BaseModel):
    tipo_documento: str


class DocumentoResponse(BaseModel):
    id_documento: int
    tipo_documento: str
    fecha_solicitado: datetime
    fecha_emision: Optional[datetime] = None
    estado: str
    archivo: Optional[str] = None
    codigo_qr: Optional[str] = None
    id_estudiante: int
    id_usuario_emite: Optional[int] = None
    id_usuario_autoriza: Optional[int] = None


class DocumentoListResponse(BaseModel):
    documentos: list[DocumentoResponse]


class DocumentoPath(BaseModel):
    id_documento: int = Field(..., description="ID del documento")
