package com.mrjohn.controller;

import java.util.List;
import java.util.Optional;

import com.mrjohn.dto.LoginDTO;
import com.mrjohn.model.Usuario;
import com.mrjohn.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    // Retorna a lista de todos os usuários do banco
    @GetMapping
    public List<Usuario> listar() {
        return repository.findAll();
    }

    // Cadastro de Usuário
    @PostMapping
    public Usuario salvar(@RequestBody Usuario usuario) {
        return repository.save(usuario);
    }

    // NOVO: Endpoint de Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {
        // 1. Buscamos o usuário no banco pelo e-mail usando o 'repository' injetado
        Optional<Usuario> usuarioOpt = repository.findByEmail(dto.email());

        // 2. Verificamos se o usuário existe
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail não encontrado.");
        }

        Usuario usuario = usuarioOpt.get();

        // 3. Comparamos a senha (comparação direta de texto conforme o padrão atual)
        if (usuario.getSenha().equals(dto.senha())) {
            // Retornamos o usuário completo (JSON) para que o Front pegue o ID e o Nome
            return ResponseEntity.ok(usuario);
        } else {
            // Caso a senha esteja incorreta
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha incorreta.");
        }
    }

    // Busca um usuário pelo ID e atualiza os dados
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> editar(@PathVariable Long id, @RequestBody Usuario usuarioAtualizado) {
        return repository.findById(id)
                .map(usuario -> {
                    usuario.setNome(usuarioAtualizado.getNome());
                    usuario.setEmail(usuarioAtualizado.getEmail());
                    usuario.setSenha(usuarioAtualizado.getSenha());
                    Usuario salvo = repository.save(usuario);
                    return ResponseEntity.ok(salvo);
                }).orElse(ResponseEntity.notFound().build());
    }

    // Remove um usuário do banco pelo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return repository.findById(id)
                .map(usuario -> {
                    repository.delete(usuario);
                    return ResponseEntity.noContent().<Void>build();
                }).orElse(ResponseEntity.notFound().build());
    }
}