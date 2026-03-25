package com.mrjohn.controller;

import com.mrjohn.model.Usuario;
import com.mrjohn.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller responsável pelas rotas de Usuário.
 * Atende ao requisito de 'Logica de Cadastro' da Sprint 1.
 */
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    /**
     * Endpoint para salvar um novo usuário no sistema.
     * O @Valid garante que as regras de @NotNull e @Email sejam respeitadas.
     */
    @PostMapping("/cadastrar")
    public Usuario cadastrar(@RequestBody @Valid Usuario usuario) {
        return repository.save(usuario);
    }

    /**
     * Endpoint auxiliar para listagem (útil para testes internos).
     */
    @GetMapping("/listar")
    public List<Usuario> listar() {
        return repository.findAll();
    }
}