#!/usr/bin/env python3
"""
Módulo de Cálculo Matemático - PyCalc Engine
Desenvolvido por Analista de Sistemas e Engenheiro Full Stack Python.

Este módulo implementa um analisador léxico (tokenizer) e um avaliador sintático
seguro baseado em Árvore de Sintaxe Abstrata (AST) do Python ou no algoritmo
Shunting-Yard, respeitando a precedência PEMDAS/BODMAS e utilizando a biblioteca
Decimal para precisão aritmética exata.
"""

import sys
import json
import re
import time
from decimal import Decimal, InvalidOperation, getcontext

# Configura precisão para 28 dígitos decimais
getcontext().prec = 28


class MathEngineError(Exception):
    """Exceção customizada para erros matemáticos e de sintaxe."""
    pass


class CalculatorEngine:
    """
    Motor matemático que processa expressões respeitando rigorosamente:
    1. Agrupamentos (parênteses)
    2. Precedência de Multiplicação e Divisão sobre Adição e Subtração
    3. Tratamento de divisão por zero
    4. Precisão decimal
    """

    OPERATORS = {
        '+': {'prec': 1, 'assoc': 'L', 'name': 'Adição'},
        '-': {'prec': 1, 'assoc': 'L', 'name': 'Subtração'},
        '*': {'prec': 2, 'assoc': 'L', 'name': 'Multiplicação'},
        '/': {'prec': 2, 'assoc': 'L', 'name': 'Divisão'},
    }

    def sanitize(self, expression: str) -> str:
        """
        Higieniza e normaliza a expressão:
        - Substitui símbolos visuais (× por *, ÷ por /, vírgula por ponto)
        - Remove espaços supérfluos
        - Valida caracteres permitidos
        """
        expr = expression.strip()
        expr = expr.replace('×', '*').replace('x', '*').replace('X', '*')
        expr = expr.replace('÷', '/').replace(':', '/')
        expr = expr.replace(',', '.')

        # Permite apenas dígitos, pontos, parênteses, operadores e espaços
        invalid_chars = re.findall(r'[^0-9\+\-\*\/\(\)\.\s]', expr)
        if invalid_chars:
            unique_invalids = list(set(invalid_chars))
            raise MathEngineError(f"Caractere inválido encontrado na expressão: {', '.join(unique_invalids)}")

        return expr

    def tokenize(self, expression: str) -> list:
        """
        Análise Léxica: converte a string de entrada em uma lista de tokens semânticos.
        Trata números decimais, operadores e números negativos unários.
        """
        sanitized = self.sanitize(expression)
        tokens = []
        i = 0
        n = len(sanitized)

        while i < n:
            char = sanitized[i]

            if char.isspace():
                i += 1
                continue

            # Detecta números (inteiros e decimais)
            if char.isdigit() or char == '.':
                num_str = ''
                has_dot = False
                while i < n and (sanitized[i].isdigit() or sanitized[i] == '.'):
                    if sanitized[i] == '.':
                        if has_dot:
                            raise MathEngineError("Formato de número inválido com múltiplos pontos decimais.")
                        has_dot = True
                    num_str += sanitized[i]
                    i += 1
                if num_str == '.':
                    raise MathEngineError("Ponto decimal isolado sem dígitos.")
                tokens.append({'type': 'NUMBER', 'value': num_str})
                continue

            # Detecta parênteses
            if char in '()':
                tokens.append({'type': 'PAREN', 'value': char})
                i += 1
                continue

            # Detecta operadores (+, -, *, /)
            if char in self.OPERATORS:
                # Tratamento de operador unário negativo (-) ou positivo (+)
                # Ocorre no início da expressão ou após outro operador / parêntese aberto '('
                is_unary = False
                if char in ('+', '-'):
                    prev_token = tokens[-1] if tokens else None
                    if prev_token is None or (prev_token['type'] in ('OPERATOR', 'PAREN') and prev_token['value'] != ')'):
                        is_unary = True

                if is_unary:
                    if char == '-':
                        tokens.append({'type': 'UNARY_OP', 'value': 'u-'})
                    # '+' unário pode ser simplesmente ignorado ou mantido
                    i += 1
                    continue

                tokens.append({'type': 'OPERATOR', 'value': char})
                i += 1
                continue

            raise MathEngineError(f"Token não reconhecido: {char}")

        if not tokens:
            raise MathEngineError("Expressão vazia.")

        return tokens

    def to_rpn(self, tokens: list) -> tuple:
        """
        Algoritmo Shunting-Yard (Edsger Dijkstra):
        Converte a sequência de tokens da notação infixa para RPN (Reverse Polish Notation),
        garantindo a precedência matemática rigorosa (PEMDAS).
        """
        output = []
        op_stack = []

        for token in tokens:
            ttype = token['type']
            val = token['value']

            if ttype == 'NUMBER':
                output.append(token)
            elif ttype == 'UNARY_OP':
                op_stack.append(token)
            elif ttype == 'OPERATOR':
                curr_prec = self.OPERATORS[val]['prec']
                while op_stack:
                    top = op_stack[-1]
                    if top['type'] == 'UNARY_OP':
                        output.append(op_stack.pop())
                        continue
                    if top['type'] == 'OPERATOR':
                        top_prec = self.OPERATORS[top['value']]['prec']
                        if top_prec >= curr_prec:
                            output.append(op_stack.pop())
                            continue
                    break
                op_stack.append(token)
            elif ttype == 'PAREN':
                if val == '(':
                    op_stack.append(token)
                elif val == ')':
                    matched = False
                    while op_stack:
                        top = op_stack.pop()
                        if top['type'] == 'PAREN' and top['value'] == '(':
                            matched = True
                            break
                        output.append(top)
                    if not matched:
                        raise MathEngineError("Parênteses desbalanceados: parêntese de fechamento ')' sem correspondente.")
                    # Se houver um unário logo antes do parêntese fechado
                    if op_stack and op_stack[-1]['type'] == 'UNARY_OP':
                        output.append(op_stack.pop())

        while op_stack:
            top = op_stack.pop()
            if top['type'] == 'PAREN':
                raise MathEngineError("Parênteses desbalanceados: parêntese de abertura '(' não foi fechado.")
            output.append(top)

        return output

    def evaluate_rpn(self, rpn_tokens: list) -> tuple:
        """
        Avalia os tokens em RPN usando uma pilha de operandos,
        gerando o histórico de passos explicativos de cada operação.
        """
        stack = []
        steps = []
        step_number = 1

        for token in rpn_tokens:
            ttype = token['type']
            val = token['value']

            if ttype == 'NUMBER':
                stack.append(Decimal(val))
            elif ttype == 'UNARY_OP':
                if not stack:
                    raise MathEngineError("Operando ausente para negação unária.")
                operand = stack.pop()
                res = -operand
                steps.append(f"Passo {step_number}: Inversão de sinal de {operand} = {res}")
                step_number += 1
                stack.append(res)
            elif ttype == 'OPERATOR':
                if len(stack) < 2:
                    raise MathEngineError(f"Operação '{val}' requer dois operandos válidos.")
                b = stack.pop()
                a = stack.pop()

                if val == '+':
                    res = a + b
                    op_name = "Adição"
                    symbol_str = "+"
                elif val == '-':
                    res = a - b
                    op_name = "Subtração"
                    symbol_str = "-"
                elif val == '*':
                    res = a * b
                    op_name = "Multiplicação"
                    symbol_str = "×"
                elif val == '/':
                    if b == 0:
                        raise MathEngineError("Divisão por zero não é permitida na matemática.")
                    res = a / b
                    op_name = "Divisão"
                    symbol_str = "÷"
                else:
                    raise MathEngineError(f"Operador desconhecido: {val}")

                # Formata operandos para o passo a passo
                a_fmt = self.format_number(a)
                b_fmt = self.format_number(b)
                res_fmt = self.format_number(res)
                steps.append(f"Passo {step_number}: {op_name} ({a_fmt} {symbol_str} {b_fmt}) = {res_fmt}")
                step_number += 1
                stack.append(res)

        if len(stack) != 1:
            raise MathEngineError("Expressão incompleta ou operadores em excesso.")

        final_result = stack.pop()
        return final_result, steps

    def format_number(self, d: Decimal) -> str:
        """Remove zeros decimais à direita desnecessários e formata."""
        if d == d.to_integral():
            return str(int(d))
        # Normaliza removendo zeros extras
        normalized = d.normalize()
        s = f"{normalized:f}"
        if '.' in s:
            s = s.rstrip('0').rstrip('.')
        return s

    def solve(self, expression: str) -> dict:
        """
        Ponto de entrada principal:
        Recebe a expressão, higieniza, tokeniza, avalia com precedência e retorna
        o resultado com metadados estruturados para o frontend e analista.
        """
        start_time = time.perf_counter()

        try:
            tokens = self.tokenize(expression)
            rpn = self.to_rpn(tokens)
            final_decimal, steps = self.evaluate_rpn(rpn)

            exec_time_ms = round((time.perf_counter() - start_time) * 1000, 3)
            formatted_res = self.format_number(final_decimal)

            return {
                "success": True,
                "result": formatted_res,
                "raw_result": str(final_decimal),
                "expression": expression,
                "sanitized": self.sanitize(expression),
                "steps": steps,
                "token_count": len(tokens),
                "rpn_tokens": [t['value'] for t in rpn],
                "execution_time_ms": exec_time_ms,
                "engine": "Python 3.10 Standard Decimal & Shunting-Yard Engine",
                "rules_applied": [
                    "Ordem PEMDAS/BODMAS respeitada",
                    "Multiplicação e Divisão prioritárias",
                    "Adição e Subtração com associatividade à esquerda",
                    "Validação estrita de divisão por zero",
                    "Precisão Decimal (28 dígitos) sem ruído de ponto flutuante"
                ]
            }

        except MathEngineError as mee:
            exec_time_ms = round((time.perf_counter() - start_time) * 1000, 3)
            return {
                "success": False,
                "error": str(mee),
                "expression": expression,
                "execution_time_ms": exec_time_ms,
                "engine": "Python 3.10 Math Engine"
            }
        except (InvalidOperation, Exception) as ex:
            exec_time_ms = round((time.perf_counter() - start_time) * 1000, 3)
            return {
                "success": False,
                "error": f"Erro de processamento matemático: {str(ex)}",
                "expression": expression,
                "execution_time_ms": exec_time_ms,
                "engine": "Python 3.10 Math Engine"
            }


def main():
    """Interface CLI para chamada via subprocesso Node.js ou terminal."""
    engine = CalculatorEngine()

    if len(sys.argv) > 1:
        # Se for passado como argumento via CLI: python3 calculator.py "10 + 5 * 2"
        expr = " ".join(sys.argv[1:])
    else:
        # Leitura via stdin
        expr = sys.stdin.read().strip()

    if not expr:
        print(json.dumps({"success": False, "error": "Nenhuma expressão fornecida."}))
        sys.exit(1)

    result = engine.solve(expr)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
