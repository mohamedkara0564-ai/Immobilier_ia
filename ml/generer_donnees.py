import random
import pandas as pd

random.seed(42)  # résultats reproductibles

# Prix moyen SIMULÉ du m² par mois (FCFA) selon le quartier
QUARTIERS = {
    "Plateau": 5200, "Cocody": 4800, "Marcory": 3600, "Treichville": 3200,
    "Bingerville": 3000, "Koumassi": 2400, "Port-Bouët": 2300,
    "Yopougon": 2200, "Adjamé": 2000, "Abobo": 1700,
}

TYPES = {
    "studio":      {"surface": (18, 40),   "coef": 1.0},
    "appartement": {"surface": (45, 140),  "coef": 1.0},
    "maison":      {"surface": (70, 220),  "coef": 1.1},
    "villa":       {"surface": (150, 400), "coef": 1.4},
}

def generer_logement():
    quartier, prix_m2 = random.choice(list(QUARTIERS.items()))
    type_bien = random.choice(list(TYPES))
    cfg = TYPES[type_bien]
    surface = random.randint(*cfg["surface"])

    if type_bien == "studio":
        nb_chambres, nb_salons, nb_sdb = 0, 1, 1
    else:
        nb_chambres = max(1, min(6, round(surface / 30) + random.choice([-1, 0, 0, 1])))
        nb_salons = 1 if surface < 150 else random.choice([1, 2])
        nb_sdb = max(1, nb_chambres - random.choice([0, 1]))

    bruit = random.uniform(0.85, 1.15)
    prix = surface * prix_m2 * cfg["coef"] * (1 + 0.03 * nb_sdb) * bruit
    prix = int(round(prix / 5000) * 5000)

    return {
        "titre": f"{type_bien.capitalize()} à {quartier}",
        "type": type_bien,
        "ville": "Abidjan",
        "quartier": quartier,
        "surface": surface,
        "nb_chambres": nb_chambres,
        "nb_salons": nb_salons,
        "nb_salles_de_bains": nb_sdb,
        "prix": prix,
    }

df = pd.DataFrame([generer_logement() for _ in range(1000)])
df.to_csv("logements_synthetiques.csv", index=False)

print(df.head())
print(df.shape)
print(df["prix"].describe())