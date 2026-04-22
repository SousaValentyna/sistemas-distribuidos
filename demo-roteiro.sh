#!/usr/bin/env bash
# =============================================================
# ROTEIRO DE TESTE — Sistemas Distribuídos N1-02
# =============================================================

echo "=== PASSO 0: Iniciando todos os contêineres ==="
docker compose up --build -d
echo "Aguardando serviços ficarem saudáveis..."
sleep 10

echo ""
echo "=== PASSO 1: Health checks ==="
curl -s http://localhost:5001/health | python3 -m json.tool
curl -s http://localhost:5002/health | python3 -m json.tool
curl -s http://localhost:5003/health | python3 -m json.tool

echo ""
echo "=== PASSO 2: Pedido normal (mostra Retry no pagamento) ==="
echo "Acompanhe os logs: docker logs -f order-service"
curl -s -X POST http://localhost:5001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "Demo Usuário",
    "restaurant": "Sakura Japanese",
    "items": [
      {"id": "s1", "name": "Sashimi de Salmão", "quantity": 2, "price": 42.90},
      {"id": "s5", "name": "Gyoza", "quantity": 1, "price": 22.00}
    ],
    "total": 107.80
  }' | python3 -m json.tool

echo ""
echo "=== PASSO 3: Derrubar o logistics-service (teste de Fallback) ==="
docker compose stop logistics-service
echo "logistics-service PARADO."

echo ""
echo "=== PASSO 3b: Pedido com Fallback de Logística ==="
curl -s -X POST http://localhost:5001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "Teste Fallback",
    "restaurant": "Napoli Pizza",
    "items": [{"id": "n1", "name": "Margherita", "quantity": 1, "price": 35.00}],
    "total": 35.00
  }' | python3 -m json.tool
echo "→ status deve ser: pending_logistics"

echo ""
echo "=== PASSO 4: Restaurar o logistics-service ==="
docker compose start logistics-service
echo "logistics-service RESTAURADO."

echo ""
echo "=== PASSO 5: Teste de Idempotência ==="
ORDER_ID=$(python3 -c "import uuid; print(uuid.uuid4())")
echo "Usando order_id: $ORDER_ID"

echo "--- Primeira requisição ---"
curl -s -X POST http://localhost:5001/orders \
  -H "Content-Type: application/json" \
  -d "{\"order_id\":\"$ORDER_ID\",\"customer\":\"Idem Test\",\"restaurant\":\"Toscana Italiana\",\"items\":[{\"id\":\"t4\",\"name\":\"Tiramisù\",\"quantity\":1,\"price\":24.00}],\"total\":24.00}" \
  | python3 -m json.tool

echo "--- Segunda requisição (mesmo order_id) ---"
curl -s -X POST http://localhost:5001/orders \
  -H "Content-Type: application/json" \
  -d "{\"order_id\":\"$ORDER_ID\",\"customer\":\"Idem Test\",\"restaurant\":\"Toscana Italiana\",\"items\":[{\"id\":\"t4\",\"name\":\"Tiramisù\",\"quantity\":1,\"price\":24.00}],\"total\":24.00}" \
  | python3 -m json.tool
echo "→ Ambas as respostas devem ser idênticas (sem cobrança dupla)"

echo ""
echo "=== FIM DO ROTEIRO ==="
echo "Frontend disponível em: http://localhost"
echo "order-service logs:    docker logs -f order-service"
