from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import json
import os
from tools import is_best_play, get_top_computer_move, get_random_computer_play, get_opening_name, get_next_fen

app = FastAPI()

# Exemple de données d'ouverture d'échecs
openings = [
    {"name": "Defense Francaise", "fen": "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3"},
    {"name": "Défense Sicilienne", "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"},
    {"name": "Gambit du Roi", "fen": "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2"}
]

# Configurer les autorisations CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/openings", response_model=List[dict])
async def get_openings():
  with open("data/opening_name.json", "r") as f:
    openings_name = json.load(f)
  result = []
  for name, opening in openings_name.items():
    if len(name.split(',')) == 4 and name.startswith('d2d4,d7d5'):
      result.append({'name': opening['name'], 'fen': opening['fen'], 'moves': name})
  return result


@app.get("/top_opening_white", response_model=List[dict])
async def get_openings():
  with open("data/top_opening_white.json", "r") as f:
    result = json.load(f)
  return result

class PlayRequest(BaseModel):
    play: str
    color: str
    fen: str
    moves: list[str]

@app.post("/valide_top_move")
async def validate_top_move(request: PlayRequest):
    play = request.play
    color = request.color
    fen = request.fen
    moves = request.moves
  
    try:
      data_fen = get_top_computer_move(color=color, fen=fen)
    except Exception as e:
      print(f"end of opening: {e}")
      return {'error': 'end_opening'}
    top_move = data_fen['top_move']
    
    valid = play == top_move
    if (play == 'e1g1' and top_move == 'e1h1') or (play == 'e1c1' and top_move == 'e1a1'):
      valid = True
    if (play == 'e8g8' and top_move == 'e8h8') or (play == 'e8c8' and top_move == 'e8a8'):
      valid = True
    played = play if not moves else f"{','.join(moves)},{play}"
    next_fen = get_next_fen(fen=fen, move=play)
    opening_name = get_opening_name(play=played, fen=next_fen, rating='0,1400') if valid else ''
    return {'valid': valid, 'move': top_move, 'cp': data_fen['cp'], 'name': opening_name}


class ComputerPlayRequest(BaseModel):
  color: str
  fen: str
  moves: List[str]
    
@app.post("/computer_play")
async def computer_play(request: ComputerPlayRequest):
  color = request.color
  fen = request.fen
  moves = request.moves
  print(f"{color=} {moves=}")
  selected_move = get_random_computer_play(play=','.join(moves), fen=fen, color=color)
  return selected_move



class SessionMove(BaseModel):
    uci: str
    score: int

class OpeningData(BaseModel):
    id: int
    score: int
    moves: List[SessionMove]

class SessionData(BaseModel):
    maxMoves: int
    NumberOfOpening: int
    startMove: List[str]
    secondes: int
    fen: str
    openingName: str
    createdAt: str
    score: int
    openings: List[OpeningData]


DATA_FILE_PATH = "data/sessions.json"

@app.post("/save_session")
async def save_session(session: SessionData):
  print(f"SESSION: {session}")
  try:
    # Assurez-vous que le dossier "data" existe
    os.makedirs(os.path.dirname(DATA_FILE_PATH), exist_ok=True)

    # Charger les sessions existantes
    if os.path.exists(DATA_FILE_PATH):
      with open(DATA_FILE_PATH, "r") as file:
        sessions = json.load(file)
    else:
      sessions = []

    # Ajouter la nouvelle session
    sessions.append(session.dict())

    # Sauvegarder les sessions dans le fichier
    with open(DATA_FILE_PATH, "w") as file:
      json.dump(sessions, file, indent=4)

    return {"status": "success", "message": "Session saved successfully"}
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error saving session: {e}")