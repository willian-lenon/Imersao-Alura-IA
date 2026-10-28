#!/usr/bin/env python3
"""
Bateria de testes unitários para o PyCalc Engine (calculator.py)
Cobre as quatro operações básicas, precedência PEMDAS, divisão por zero e porcentagens (%).
"""

import unittest
from decimal import Decimal
from calculator import CalculatorEngine, MathEngineError


class TestCalculatorEngine(unittest.TestCase):
    def setUp(self):
        self.engine = CalculatorEngine()

    # --- Testes das 4 Operações Básicas ---
    def test_adicao(self):
        res = self.engine.solve("15 + 27")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "42")

    def test_subtracao(self):
        res = self.engine.solve("100 - 35")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "65")

    def test_multiplicacao(self):
        res = self.engine.solve("8 * 7")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "56")

    def test_divisao(self):
        res = self.engine.solve("144 / 12")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "12")

    def test_divisao_por_zero(self):
        res = self.engine.solve("10 / 0")
        self.assertFalse(res["success"])
        self.assertIn("Divisão por zero", res["error"])

    # --- Testes de Precedência (PEMDAS) ---
    def test_precedencia_multiplicacao_adicao(self):
        res = self.engine.solve("10 + 5 * 2")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "20")

    def test_parenteses(self):
        res = self.engine.solve("(10 + 5) * 2")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "30")

    # --- Testes de Precisão Decimal ---
    def test_precisao_decimal(self):
        res = self.engine.solve("0.1 + 0.2")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "0.3")

    # --- Testes da Nova Funcionalidade: Porcentagem (%) ---
    def test_porcentagem_isolada(self):
        res = self.engine.solve("50%")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "0.5")

    def test_porcentagem_multiplicacao(self):
        # 15% de 200 = 30
        res = self.engine.solve("200 * 15%")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "30")

    def test_porcentagem_adicao_comercial(self):
        # Acréscimo de 20% sobre 100 = 120
        res = self.engine.solve("100 + 20%")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "120")

    def test_porcentagem_subtracao_comercial(self):
        # Desconto de 15% sobre 100 = 85
        res = self.engine.solve("100 - 15%")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "85")

    def test_porcentagem_com_parenteses(self):
        # (50 + 50)% = 100% = 1
        res = self.engine.solve("(50 + 50)%")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "1")

    def test_porcentagem_decimal(self):
        # 12.5% = 0.125
        res = self.engine.solve("12.5%")
        self.assertTrue(res["success"])
        self.assertEqual(res["result"], "0.125")

    def test_porcentagem_invalida_inicio(self):
        res = self.engine.solve("%50")
        self.assertFalse(res["success"])


if __name__ == "__main__":
    unittest.main()
