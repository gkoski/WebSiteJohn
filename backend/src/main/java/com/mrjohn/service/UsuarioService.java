package com.mrjohn.service;

import com.mrjohn.dto.LoginDTO;
import com.mrjohn.dto.UsuarioResponseDTO;
import com.mrjohn.model.Usuario;
import com.mrjohn.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // Cadastro com BCrypt
    public UsuarioResponseDTO cadastrar(Usuario usuario) {
        if (repository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado.");
        }
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        // Garante role padrão
        if (usuario.getRole() == null || usuario.getRole().isBlank()) {
            usuario.setRole("CLIENTE");
        }
        Usuario salvo = repository.save(usuario);
        return new UsuarioResponseDTO(salvo.getId(), salvo.getNome(), salvo.getEmail());
    }

    // Login — retorna token JWT
    public String login(LoginDTO dto) {
        Usuario usuario = repository.findByEmail(dto.email())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "E-mail não encontrado."));

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Senha incorreta.");
        }

        // Garante role padrão se null
        String role = (usuario.getRole() != null && !usuario.getRole().isBlank())
                ? usuario.getRole() : "CLIENTE";

        return jwtService.generateToken(usuario.getEmail(), role);
    }

    // Buscar por email
    public Usuario buscarPorEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    // Editar usuário
    public ResponseEntity<UsuarioResponseDTO> editar(Long id, Usuario usuarioAtualizado) {
        return repository.findById(id)
                .map(usuario -> {
                    usuario.setNome(usuarioAtualizado.getNome());
                    usuario.setEmail(usuarioAtualizado.getEmail());
                    if (usuarioAtualizado.getSenha() != null && !usuarioAtualizado.getSenha().isBlank()) {
                        usuario.setSenha(passwordEncoder.encode(usuarioAtualizado.getSenha()));
                    }
                    Usuario salvo = repository.save(usuario);
                    return ResponseEntity.ok(new UsuarioResponseDTO(salvo.getId(), salvo.getNome(), salvo.getEmail()));
                }).orElse(ResponseEntity.notFound().build());
    }

    // Deletar usuário
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
        }
        repository.deleteById(id);
    }
}