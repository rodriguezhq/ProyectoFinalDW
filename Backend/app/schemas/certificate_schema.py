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
    estudiante_nombre: Optional[str] = None
    estudiante_codigo: Optional[str] = None
    id_usuario_emite: Optional[int] = None
    id_usuario_autoriza: Optional[int] = None


class DocumentoListResponse(BaseModel):
    documentos: list[DocumentoResponse]
    total: int
    page: int
    per_page: int
    hay_mas: bool


class DocumentoPath(BaseModel):
    id_documento: int = Field(..., description="ID del documento")


class VerificacionPath(BaseModel):
    codigo_qr: str = Field(..., description="Código QR del documento a verificar")


class VerificacionResponse(BaseModel):
    valido: bool
    tipo_documento: str
    estudiante_nombre: str
    fecha_emision: datetime
    institucion: str = "Universidad Nacional del Centro del Perú"
