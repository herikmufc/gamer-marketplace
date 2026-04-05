"""
Cliente para API do Mercado Envios
Documentação: https://developers.mercadopago.com/pt/docs/shipping/reference/shipping
"""

import requests
import os
from typing import Dict, List, Optional

class MercadoEnviosClient:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.mercadolibre.com"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

    def calculate_shipping(
        self,
        from_zipcode: str,
        to_zipcode: str,
        dimensions: Dict[str, float],  # {"weight": kg, "length": cm, "width": cm, "height": cm}
        free_shipping: bool = False
    ) -> List[Dict]:
        """
        Calcula opções de frete disponíveis

        Args:
            from_zipcode: CEP de origem (vendedor)
            to_zipcode: CEP de destino (comprador)
            dimensions: Dimensões do pacote
            free_shipping: Se o frete é grátis

        Returns:
            Lista de opções de envio com preços e prazos
        """
        try:
            # Endpoint para cálculo de frete
            url = f"{self.base_url}/shipments/options"

            # Converter dimensões para formato do ME
            payload = {
                "dimensions": {
                    "weight": int(dimensions.get("weight", 500)),  # gramas
                    "length": int(dimensions.get("length", 20)),  # cm
                    "width": int(dimensions.get("width", 15)),  # cm
                    "height": int(dimensions.get("height", 10))  # cm
                },
                "zip_code_from": from_zipcode.replace("-", ""),
                "zip_code_to": to_zipcode.replace("-", ""),
                "free_shipping": free_shipping,
                "item_price": 100  # Preço mínimo para cálculo
            }

            print(f"📦 [MERCADO ENVIOS] Calculando frete:")
            print(f"   De: {from_zipcode} → Para: {to_zipcode}")
            print(f"   Dimensões: {dimensions}")

            response = requests.post(url, json=payload, headers=self.headers, timeout=10)

            if response.status_code == 200:
                options = response.json().get("options", [])
                print(f"✅ [MERCADO ENVIOS] {len(options)} opções encontradas")
                return options
            else:
                print(f"❌ [MERCADO ENVIOS] Erro {response.status_code}: {response.text}")
                return []

        except Exception as e:
            print(f"❌ [MERCADO ENVIOS] Erro ao calcular frete: {e}")
            return []

    def create_shipment(
        self,
        shipping_method_id: int,
        sender: Dict,
        receiver: Dict,
        dimensions: Dict
    ) -> Optional[Dict]:
        """
        Cria um envio no Mercado Envios

        Args:
            shipping_method_id: ID do método de envio escolhido
            sender: Dados do remetente (vendedor)
            receiver: Dados do destinatário (comprador)
            dimensions: Dimensões do pacote

        Returns:
            Dados do envio criado (com ID e etiqueta)
        """
        try:
            url = f"{self.base_url}/shipments"

            payload = {
                "mode": "me2",  # Mercado Envios 2.0
                "shipping_method_id": shipping_method_id,
                "sender": sender,
                "receiver": receiver,
                "dimensions": dimensions
            }

            print(f"📦 [MERCADO ENVIOS] Criando envio...")
            response = requests.post(url, json=payload, headers=self.headers, timeout=10)

            if response.status_code in [200, 201]:
                shipment = response.json()
                print(f"✅ [MERCADO ENVIOS] Envio criado: {shipment.get('id')}")
                return shipment
            else:
                print(f"❌ [MERCADO ENVIOS] Erro {response.status_code}: {response.text}")
                return None

        except Exception as e:
            print(f"❌ [MERCADO ENVIOS] Erro ao criar envio: {e}")
            return None

    def get_shipment(self, shipment_id: str) -> Optional[Dict]:
        """
        Obtém informações de um envio

        Args:
            shipment_id: ID do envio

        Returns:
            Dados atualizados do envio
        """
        try:
            url = f"{self.base_url}/shipments/{shipment_id}"
            response = requests.get(url, headers=self.headers, timeout=10)

            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ [MERCADO ENVIOS] Erro ao buscar envio: {response.status_code}")
                return None

        except Exception as e:
            print(f"❌ [MERCADO ENVIOS] Erro ao buscar envio: {e}")
            return None

    def print_label(self, shipment_id: str) -> Optional[str]:
        """
        Obtém URL da etiqueta de envio para impressão

        Args:
            shipment_id: ID do envio

        Returns:
            URL da etiqueta em PDF
        """
        try:
            shipment = self.get_shipment(shipment_id)
            if shipment:
                label_url = shipment.get("label", {}).get("url")
                return label_url
            return None

        except Exception as e:
            print(f"❌ [MERCADO ENVIOS] Erro ao obter etiqueta: {e}")
            return None
