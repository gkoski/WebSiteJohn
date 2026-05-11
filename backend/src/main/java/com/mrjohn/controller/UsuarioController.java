package com.mrjohn.controller;

import java.util.Optional;
import com.mrjohn.dto.LoginDTO;
import com.mrjohn.dto.UsuarioResponseDTO;
import com.mrjohn.model.Usuario;
import com.mrjohn.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    // Cadastro de Usuário
    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> salvar(@Valid @RequestBody Usuario usuario) {
        Usuario salvo = repository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UsuarioResponseDTO(salvo.getId(), salvo.getNome(), salvo.getEmail()));
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {
        Optional<Usuario> usuarioOpt = repository.findByEmail(dto.email());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail não encontrado.");
        }

        Usuario usuario = usuarioOpt.get();

        if (usuario.getSenha().equals(dto.senha())) {
            return ResponseEntity.ok(
                    new UsuarioResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail())
            );
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha incorreta.");
    }

    // Editar usuário
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> editar(@PathVariable Long id, @RequestBody Usuario usuarioAtualizado) {
        return repository.findById(id)
                .map(usuario -> {
                    usuario.setNome(usuarioAtualizado.getNome());
                    usuario.setEmail(usuarioAtualizado.getEmail());
                    usuario.setSenha(usuarioAtualizado.getSenha());
                    Usuario salvo = repository.save(usuario);
                    return ResponseEntity.ok(new UsuarioResponseDTO(salvo.getId(), salvo.getNome(), salvo.getEmail()));
                }).orElse(ResponseEntity.notFound().build());
    }

    // Deletar usuário
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return repository.findById(id)
                .map(usuario -> {
                    repository.delete(usuario);
                    return ResponseEntity.noContent().<Void>build();
                }).orElse(ResponseEntity.notFound().build());
    }
}