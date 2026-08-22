# WebSiteJohn

Sistema de delivery interno para o Mr John SportBar & Eventos, desenvolvido para resolver o atendimento de pedidos do estabelecimento.

Projeto full-stack em equipe, disciplina de Engenharia de Software: Gabriel de Carvalho Joukoski, Douglas Alves Ribeiro (Scrum Master) e Victor Henrique Bayuk Pontes.

## O problema

O bar não tinha um sistema próprio para receber e acompanhar pedidos de entrega, dependendo de processos manuais e desorganizados.

## Funcionalidades

- Cardápio com categorias e fotos dos produtos
- Cálculo de entrega por bairro
- Fluxo de pedido com status (recebido, preparando, enviado, entregue, cancelado)
- Autenticação de usuário via JWT
- Upload de imagens dos produtos

## Stack

**Frontend:** HTML, CSS, JavaScript
**Backend:** Java, Spring Boot, MySQL

## Configuração

Copie `backend/.env.example` para `.env` (ou exporte como variáveis de ambiente) e preencha `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET` com valores próprios antes de rodar.

## Status

Concluído (entrega acadêmica). Nunca esteve em produção.
