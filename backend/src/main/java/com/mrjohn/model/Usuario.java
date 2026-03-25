package com.mrjohn.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Entidade Usuario configurada para Spring Boot.
 * Representa a tabela 'usuarios' no banco de dados do Mr. John SportBar.
 * 
 * @author Douglas Ribeiro
 */
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 100)
    private String nome;

    @Email
    @NotNull
    private String email;

    @NotNull
    @Size(min = 5, max = 50)
    private String login;

    @NotNull
    private String senha; // armazenar hash, não texto puro

    // Construtor padrão para o Spring/JPA
    public Usuario() {}

    // Construtor completo
    public Usuario(String nome, String email, String login, String senha) {
        this.nome = nome;
        this.email = email;
        this.login = login;
        this.senha = senha;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    // equals e hashCode baseados no ID
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Usuario)) return false;
        Usuario usuario = (Usuario) o;
        return id != null && id.equals(usuario.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // toString sem expor a senha
    @Override
    public String toString() {
        return "Usuario{id=" + id + 
               ", nome='" + nome + '\'' +
               ", email='" + email + '\'' +
               ", login='" + login + '\'' +
               '}';
    }
}
