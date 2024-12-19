import chess
from stockfish import Stockfish


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
# Exemple de position FEN
fen_position = "rnbqkb1r/pppp1ppp/8/4p3/4n3/P4P1P/1PPPP1P1/RNBQKBNR w KQkq - 1 4"


stockfish.set_fen_position(fen_position)

# Obtenir le meilleur coup
best_move = stockfish.get_best_move()
evaluation = stockfish.get_evaluation()
print("Évaluation :", evaluation)
print("Meilleur coup:", best_move)


import requests


fen="r2qkb1r/1bpp1ppp/p7/1pnBP3/3n4/8/PPP2PPP/RNBQ1RK1 w kq - 0 11"
response = requests.get(
    "https://lichess.org/api/cloud-eval",
    params={
        "fen": fen_position,
        "multiPv": 50,
    }
)

print(response.json())