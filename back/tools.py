import json
import os
from stockfish import Stockfish
import chess
import random
import requests
from time import sleep




stockfish_path = "/home/ybousquet/chess_engines/stockfish/stockfish-ubuntu-x86-64-sse41-popcnt"


# Initialiser Stockfish
stockfish = Stockfish(path=stockfish_path)
stockfish.set_skill_level(20)  # Facultatif, pour ajuster le niveau de compétence du moteur

stockfish.update_engine_parameters({
    "Threads": 2,             # Utiliser 4 threads (adapter selon le nombre de cœurs de votre CPU)
    "Hash": 2048,             # Utiliser 2 Go de RAM pour le cache du moteur (augmentez si plus de RAM disponible)
    "UCI_LimitStrength": False,  # Désactiver la limitation de la force
    "UCI_Elo": 2850,          # Elo maximal de Stockfish
})

def get_evaluation_stockfish_cp(fen: str):
  stockfish.set_fen_position(fen)
  evaluation = stockfish.get_evaluation()
  return evaluation['value']

def is_best_play(color: str, fen: str, play: str):
  with open(f'data/computer_{color}/computer.json', 'r') as f:
    fens = json.load(f)
    
  if fen in fens:
    top_move = fens[fen]['top_move']
    return top_move == play
  else:
    print(f"fen doesn't exist: {fen}")
    
    
def get_top_computer_move(color: str, fen: str):
  print(f"FENNN={fen}")
  filename = f'data/computer_{color}/computer.json'
  if os.path.exists(filename):
    with open(filename, 'r') as f:
        fen_cache = json.load(f)
  else:
    fen_cache = {}

  if fen in fen_cache:
    cp = fen_cache[fen]['cp']
    print(f'FEN find')
    return fen_cache[fen]

  try:
    response = requests.get(
        "https://lichess.org/api/cloud-eval",
        params={
            "fen": fen,
            "multiPv": 50,
        }
    )
    data = response.json()
    if color == 'black':
      better = min(data['pvs'], key=lambda x: x['cp'])
    elif color == 'white':
      better = max(data['pvs'], key=lambda x: x['cp'])
    else:
      raise ValueError("La couleur doit être 'white' ou 'black'.")

    top_move = better['moves'].split(' ')[0]
    better['top_move'] = top_move
    fen_cache[fen] = better

    with open(filename, 'w') as f:
      json.dump(fen_cache, f, separators=(',', ': '), indent=4)
    print(f"FEN create")
    return fen_cache[fen]

  except Exception as e:
    print(f"Erreur lors de l'appel API : {e}")
    raise Exception("error")
  
  
def get_random_computer_play(play: str, fen: str, color: str):
  print(f"{play=}")
  filename = f'data/computer_{color}/random_play.json'
  opening = get_openings(play=play, fen=fen, rating="0,1400", move=20, filename=filename)
  selected_play = choice_a_play(opening=opening)
  if 'error' in selected_play:
    return selected_play
  next_fen = get_next_fen(fen, selected_play['uci2'])
  print(f"before opening_name {play},{selected_play['uci2']}")
  played = f'{play},{selected_play["uci2"]}' if play else selected_play["uci2"]
  opening_name = get_opening_name(play=played, fen=next_fen, rating='0,1400')

  print(f"{next_fen=}")
  cp = get_evaluation_stockfish_cp(fen=next_fen)
  selected_play['cp'] = cp
  selected_play['name'] = opening_name
  if selected_play['uci2'] == 'e1a1':
    selected_play['uci2'] = 'e1c1'
  if selected_play['uci2'] == 'e1h1':
    selected_play['uci2'] = 'e1g1'
  if selected_play['uci2'] == 'e8a8':
    selected_play['uci2'] = 'e8c8'
  if selected_play['uci2'] == 'e8h8':
    selected_play['uci2'] = 'e8g8'
  print(f"HEEERRRE: {selected_play}")
  return selected_play
  
  
  
def extract_data(data):
    opening = {"moves": [], "count": 0}
    total_games = sum(sum([move["white"], move["black"], move["draws"]]) for move in data["moves"])

    opening["total_game_move"] = total_games
    opening["name"] = data.get("opening", None)

    for move in data["moves"]:
        total = move["black"] + move["white"] + move["draws"]
        winrate_white = move["white"] / total * 100
        winrate_black = move["black"] / total * 100
        draw_rate = move["draws"] / total * 100
        freq_move = total / total_games * 100
        line = {
            "total_games": total,
            "freq": round(freq_move, 2),
            "uci": move["uci"]
        }
        opening["moves"].append(line)

    return opening

def get_openings(play: str, rating: str, fen:str, move: int = 20, retries: int = 3, filename=None):
  if os.path.exists(filename):
    with open(filename, 'r') as f:
        opening_cache = json.load(f)
  else:
    opening_cache = {}

  if play in opening_cache:
    print(f"opening already exist")
    opening_cache[play]['count'] += 1
    with open(filename, 'w') as f:
      json.dump(opening_cache, f, indent=4)
    
    return opening_cache[play]
  
  print(f"play before {play}")
  url = "https://explorer.lichess.ovh/lichess"
  params = {
      "play": play,
      "ratings": rating,
      "moves": move
  }

  for attempt in range(retries):
    try:
      response = requests.get(url, params=params)
      status_code = response.status_code
      response.raise_for_status()  # Vérifie les erreurs HTTP
      result = extract_data(response.json())
      
      opening_cache[play] = result
      opening_cache[play]['fen'] = fen
      with open(filename, 'w') as f:
        json.dump(opening_cache, f, indent=4)
      return opening_cache[play]
    
    except requests.exceptions.HTTPError as http_err:
      print(f"HTTP error occurred: code={status_code} {http_err} - Attempt {attempt + 1} of {retries}")
      print(f"MOVE NOT CORRECT PROBABILITY")

    except requests.exceptions.ConnectionError as conn_err:
      print(f"Connection error occurred: code={status_code}{conn_err} - Attempt {attempt + 1} of {retries}")

    except requests.exceptions.Timeout as timeout_err:
      print(f"Timeout error occurred: code={status_code}{timeout_err} - Attempt {attempt + 1} of {retries}")

    except requests.exceptions.RequestException as req_err:
      print(f"Error during GET openings: code={status_code}{req_err} - Attempt {attempt + 1} of {retries}")

    except ValueError as val_err:
      print(f"JSON decoding failed: code={status_code}{val_err} - Attempt {attempt + 1} of {retries}")


    if attempt < retries - 1:  # Attendre seulement si ce n'est pas le dernier essai
      print("Waiting 60s before retrying...")
      sleep(60)
  print(f"Failed to get data after {retries} attempts.")
  raise Exception("error")

def choice_a_play(opening: dict):
    moves_data = opening.get("moves", [])
    moves = [move["uci"] for move in moves_data]
    weights = [move["freq"] for move in moves_data]
    if not moves or not weights:
        return {"error": "no more line"}

    selected_move = random.choices(moves, weights=weights, k=1)[0]
    selected_move_uci = random.choices(moves, weights=weights, k=1)[0]
    selected_move = next(move for move in moves_data if move["uci"] == selected_move_uci)
    move = f"{selected_move_uci[:2]}-{selected_move_uci[2:]}"
    selected_move["uci"] = move
    selected_move["uci2"] = selected_move_uci
    selected_move["name"] = opening["name"]
    return selected_move
  
def get_next_fen(fen: str, move: str) -> str:
  board = chess.Board(fen)
  chess_move = chess.Move.from_uci(move)
  if chess_move in board.legal_moves:
      board.push(chess_move)
      return board.fen()
  else:
      raise ValueError(f"Mouvement illégal: {move}")
    
    
def get_opening_name(play: str, rating: str, fen: str,  move: int = 2, retries: int = 3, filename='data/opening_name.json'):
  if os.path.exists(filename):
    with open(filename, 'r') as f:
        opening_cache = json.load(f)
  else:
    opening_cache = {}

  if play in opening_cache:
    print(f"opening name already exist")
    return opening_cache[play]
  
  url = "https://explorer.lichess.ovh/lichess"
  params = {
      "play": play,
      "ratings": rating,
      "moves": move,
  }

  for attempt in range(retries):
    try:
      response = requests.get(url, params=params)
      status_code = response.status_code
      response.raise_for_status()  # Vérifie les erreurs HTTP
      result = extract_data(response.json())
      
      print(f"{result=}")
      opening_cache[play] = result['name']
      opening_cache[play]['fen'] = fen
      with open(filename, 'w') as f:
        json.dump(opening_cache, f, indent=4)
      return opening_cache[play]
    
    except requests.exceptions.HTTPError as http_err:
      print(f"HTTP error occurred: code={status_code} {http_err} - Attempt {attempt + 1} of {retries}")
      print(f"MOVE NOT CORRECT PROBABILITY")

    except requests.exceptions.ConnectionError as conn_err:
      print(f"Connection error occurred: code={status_code}{conn_err} - Attempt {attempt + 1} of {retries}")

    except requests.exceptions.Timeout as timeout_err:
      print(f"Timeout error occurred: code={status_code}{timeout_err} - Attempt {attempt + 1} of {retries}")

    except requests.exceptions.RequestException as req_err:
      print(f"Error during GET openings: code={status_code}{req_err} - Attempt {attempt + 1} of {retries}")

    except ValueError as val_err:
      print(f"JSON decoding failed: code={status_code}{val_err} - Attempt {attempt + 1} of {retries}")


    if attempt < retries - 1:  # Attendre seulement si ce n'est pas le dernier essai
      print("Waiting 60s before retrying...")
      sleep(60)
  print(f"Failed to get data after {retries} attempts.")
  raise Exception("error")
    
    
if __name__ == '__main__':
  url = "https://explorer.lichess.ovh/lichess"
  params = {
      "play": 'e2e4,d7d5,c2c4',
      "ratings": '0,3000',
      "moves": 1,
      "topGames": 1
  }

  response = requests.get(url, params=params)
  print(response.json())