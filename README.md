# WebSiteJohn

Sistema de delivery interno para o Mr John SportBar & Eventos, desenvolvido para resolver o atendimento de pedidos do estabelecimento.

Projeto full-stack em equipe, disciplina de Engenharia de Software: Gabriel de Carvalho Joukoski, Douglas Alves Ribeiro (Scrum Master) e Victor Henrique Bayuk Pontes.

## O problema

O bar não tinha um sistema próprio para receber e acompanhar pedidos de entrega, dependendo de processos manuais e desorganizados.

## Funcionalidades

- Cardápio com categorias e fotos dos produtos
- Cálculo de entrega por bairro
- Cadastro e login de usuário com autenticação JWT
- Fluxo de pedido com status (recebido, preparando, enviado, entregue, cancelado)
- Acompanhamento do pedido pelo cliente
- Upload de imagens dos produtos
- Documentação da API via Swagger/OpenAPI

## Arquitetura

Backend em camadas (controller, service, repository, model, dto), com autenticação stateless via JWT, Spring Security protegendo os endpoints administrativos e controle de acesso por papel (`role` do usuário).

Entidades principais: Usuário, Produto, Categoria, Pedido, Item de Pedido, Bairro de Entrega.

`database/schema` tem o SQL de criação das tabelas; `database/menu` tem um seed de exemplo com categorias e produtos.

## Stack

**Frontend:** HTML, CSS, JavaScript
**Backend:** Java 21, Spring Boot 3.2, Spring Security, Spring Data JPA, MySQL, JWT (jjwt), Swagger/OpenAPI

## Como rodar

**Backend:**
1. Copie `backend/.env.example` para `.env` (ou exporte como variáveis de ambiente) e preencha `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET`
2. `cd backend`
3. `mvn spring-boot:run`

**Frontend:**
Abra os arquivos em `frontend/` num servidor local (Live Server, por exemplo), apontando as chamadas de API para o backend rodando.

## Status

Concluído (entrega acadêmica). Nunca esteve em produção.
