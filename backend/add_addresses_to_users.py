"""
Script para adicionar endereços fictícios aos usuários existentes
Executar: python3 add_addresses_to_users.py
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Usar as mesmas configurações do main.py
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gamer_marketplace.db")

# Fix para Render (postgres:// -> postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Endereços fictícios em Niterói/RJ
ADDRESSES = [
    {
        "zipcode": "24120200",
        "street": "Rua Moreira César",
        "number": "157",
        "complement": "Apt 302",
        "neighborhood": "Icaraí",
        "city": "Niterói",
        "state": "RJ"
    },
    {
        "zipcode": "24230090",
        "street": "Rua Miguel de Frias",
        "number": "89",
        "complement": None,
        "neighborhood": "Ingá",
        "city": "Niterói",
        "state": "RJ"
    },
]

def add_addresses():
    db = SessionLocal()

    try:
        # Buscar todos os usuários
        result = db.execute(text("SELECT id, username, email FROM users ORDER BY id"))
        users = result.fetchall()

        if not users:
            print("❌ Nenhum usuário encontrado no banco de dados")
            return

        print(f"✅ Encontrados {len(users)} usuários")
        print()

        for idx, user in enumerate(users):
            user_id, username, email = user

            # Pegar endereço baseado no índice (circular se tiver mais usuários que endereços)
            address = ADDRESSES[idx % len(ADDRESSES)]

            # Atualizar endereço do usuário
            update_sql = text("""
                UPDATE users
                SET
                    address_zipcode = :zipcode,
                    address_street = :street,
                    address_number = :number,
                    address_complement = :complement,
                    address_neighborhood = :neighborhood,
                    address_city = :city,
                    address_state = :state
                WHERE id = :user_id
            """)

            db.execute(update_sql, {
                "user_id": user_id,
                "zipcode": address["zipcode"],
                "street": address["street"],
                "number": address["number"],
                "complement": address["complement"],
                "neighborhood": address["neighborhood"],
                "city": address["city"],
                "state": address["state"]
            })

            print(f"✅ Usuário: {username} ({email})")
            print(f"   📍 {address['street']}, {address['number']}")
            print(f"      {address['neighborhood']} - {address['city']}/{address['state']}")
            print(f"      CEP: {address['zipcode']}")
            print()

        db.commit()
        print(f"🎉 Endereços adicionados com sucesso para {len(users)} usuários!")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao adicionar endereços: {e}")
        import traceback
        traceback.print_exc()

    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Adicionando endereços fictícios aos usuários...")
    print()
    add_addresses()
