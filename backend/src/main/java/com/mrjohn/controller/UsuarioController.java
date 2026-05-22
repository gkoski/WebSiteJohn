package com.mrjohn.controller;

import com.mrjohn.dto.LoginDTO;
import com.mrjohn.dto.UsuarioResponseDTO;
import com.mrjohn.model.Usuario;
import com.mrjohn.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Cadastro
    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> cadastrar(@Valid @RequestBody Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usuarioService.cadastrar(usuario));
    }

    // Login — retorna token + dados do usuário
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginDTO dto) {
        String token = usuarioService.login(dto);
        Usuario usuario = usuarioService.buscarPorEmail(dto.email());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", usuario.getId(),
                "nome", usuario.getNome(),
                "email", usuario.getEmail(),
                "role", usuario.getRole()
        ));
    }

    // Editar usuário
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> editar(
            @PathVariable Long id,
            @RequestBody Usuario usuarioAtualizado) {
        return usuarioService.editar(id, usuarioAtualizado);
    }

    // Deletar usuário
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}