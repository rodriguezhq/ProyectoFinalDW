from pydantic import BaseModel

from app.schemas.user_schema import UserData


class LoginBody(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    msg: str
    access_token: str
    refresh_token: str
    user: UserData
